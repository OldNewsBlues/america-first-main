import { get } from 'svelte/store';
import {records} from '$lib/stores';
import { 
	loadPlayers, 
	getPreviousDrafts, 
	nflPlayerInfo, 
	nflPlayerInfo2,
	leagueID, 
	managers, 
	importHistory, 
	importType, 
	getLeagueUsers, 
	getLeagueRosters, 
	getLeagueTransactions,
	getNflState,
	getLeagueData,
	waitForAll,
	leagueHistory,
	getStarterPositions,
    predictScores,
	nflTeams } from '$lib/utils/helper';

export const getLeagueRecords = async (refresh = false) => {
    if(get(records).masterRecordBook) return get(records);

    const [playersData, previousDraftsData, nflState, transactionsData] = await waitForAll(
        loadPlayers(),
        getPreviousDrafts(),
        getNflState(),
        getLeagueTransactions(false),
    ).catch((err) => { console.error(err); });

    let transactions = transactionsData.transactions;
    let transactionTotals = transactionsData.totals;
    if(transactionsData.stale) {
        const newTransactions = await getLeagueTransactions(false, true);
        transactions = newTransactions.transactions;
        transactionTotals = newTransactions.totals;
    }

    let playersInfo = playersData.players;
    if(playersData.stale) {
        const newPlayersData = await loadPlayers(true);
        playersInfo = newPlayersData.players;
    }

    const draftInfo = {};
    for(const draft of previousDraftsData) {
        draftInfo[draft.year] = draft;
    }

    const transactionsInfo = {
        totals: transactionTotals.allTime,
        years: {},
    };
    for(const transaction of transactions) {
        if(!transactionsInfo.years[transaction.year]) {
            transactionsInfo.years[transaction.year] = {
                waiver: [],
                trade: [],
                freeAgent: [],
                totals: transactionTotals.seasons[transaction.year],
            }
        }
        transactionsInfo.years[transaction.year][transaction.type].push(transaction);
    }

    let week;
    if(nflState.season_type == 'regular') {
        week = nflState.week - 1;
    } else if(nflState.season_type == 'post') {
        week = 18;
    }

    let curSeason = leagueID;

    const allManagers = {};
    const recordPeriods = [
        'regular',
        'playoffs',
        'combined',
    ];
    const transTypes = [
        'draft',
        'trade',
        'waiver',
        'freeAgent',
    ];
    const playerTypes = [
        'starters',
        'bench',
        'total',
        'opp',
    ];
    const outcomeTypes = [
        'W',
        'T',
        'L',
    ];
    const recordTypes = [
        'match',
        'EPE',
        'median',
        'bball',
        'bballEPE',
        'iq',
        'iqEPE',
        'upsets',
        'uni',
    ];
    
    let currentYear, lastYear;
    const masterRecordBook = {
        weeks: {
            players: [],
            managers: [],
        },
        seasons: {
            players: {},
            managers: {},
        },
        careers: {
            players: {},
            managers: {},
        },
    };

    const leagueManagers = {};
    const headToHeadRecords = {};
    const fantasyPositionRanks = {};

    const recordArrays = {
        league: {
            years: {},
            alltime: {},
        },
        managers: {
            years: {},
            alltime: {},
        },
    };
    const acquisitionRecords = {};
    const rosterPositions = {
        years: {},
        alltime: [],
    };

    const numManagers = managers.length;
    const leagueRecordManagers = {};
    for(const manager of managers) {

        const entryMan = {
            managerID: manager.managerID,
            rosterID: manager.roster,
            name: manager.name,
            status: manager.status,
            yearsactive: manager.yearsactive,
        }

        if(!leagueManagers[manager.roster]) leagueManagers[manager.roster] = [];
        leagueManagers[manager.roster].push(entryMan);
        leagueRecordManagers[manager.managerID] = entryMan;
    }       

    while(curSeason && curSeason != 0) {
        const [rosterRes, users, leagueData] = await waitForAll(
            getLeagueRosters(curSeason),
            getLeagueUsers(curSeason),
            getLeagueData(curSeason),
        ).catch((err) => { console.error(err); });
    
        const year = parseInt(leagueData.season);
        if(!currentYear) currentYear = year;

        // TRANSACTION-related info
        const faabWaivers = leagueData.settings.waiver_type == 2 ? true : false;
        const auctionDraft = draftInfo[year].draftType == 'auction' ? true : false;
            // must re-order transactions first-in-time to record add & drop weeks
        for(const type in transactionsInfo.years[year]) {
            if(type != 'totals') transactionsInfo.years[year][type] = transactionsInfo.years[year][type].reverse();
        }

        // POSITIONS - get fantasy positions for year & alltime
        const rosterSpots = getStarterPositions(leagueData);
        rosterPositions.years[year] = [];
        fantasyPositionRanks[year] = {};
        fantasyPositionRanks[year].OVR = [];
        for(const spot of rosterSpots) {
            if(!rosterPositions.years[year].includes(spot) && !spot.includes('FLEX')) rosterPositions.years[year].push(spot);
            if(!rosterPositions.alltime.includes(spot) && !spot.includes('FLEX')) rosterPositions.alltime.push(spot);
            if(!fantasyPositionRanks[year][spot] && !spot.includes('FLEX')) fantasyPositionRanks[year][spot] = [];
        }

        // variables for playoff records
        const numPOTeams = parseInt(leagueData.settings.playoff_teams);
        const playoffStart = parseInt(leagueData.settings.playoff_week_start);
        let playoffLength, playoffCase;							// for later determining which playoff matchups we want to count (vs. discard)

        // before 2020, 1 week per PO round was only option
        let playoffType = year > 2019 ? parseInt(leagueData.settings.playoff_round_type) : 0;

        // calculate length of playoffs										"Relevant" Match IDs
        if(playoffType == 0) {							// 1W/r		4-team		6-team		8-team
            if(numPOTeams == 6) {						// last:	1, 2		1, 2		1, 2, 3, 4 						
                playoffLength = 3;						// 2-last:	1, 2		1, 2, 3		1, 2, 3, 4
                playoffCase = 1;						// 3-last:				1, 2		1, 2, 3, 4
            } else if(numPOTeams == 8) {
                playoffLength = 3;
                playoffCase = 2;
            } else if(numPOTeams == 4) {			
                playoffLength = 2;						
                playoffCase = 3;					
            }
        } else if(playoffType == 1 && year > 2020) {	// 1W/r+2c  4-team		6-team		8-team
            if(numPOTeams == 6) {						// last:	1			1			1
                playoffLength = 4;						// 2-last:	1, 2		1, 2		1, 2, 3, 4
                playoffCase = 4;						// 3-last:	1, 2		1, 2, 3		1, 2, 3, 4
            } else if(numPOTeams == 8) {				// 4-last:				1, 2		1, 2, 3, 4
                playoffLength = 4;
                playoffCase = 5
            } else if(numPOTeams == 4) {
                playoffLength = 3;
                playoffCase = 6;
            }
        } else if(playoffType == 2 ||
                    playoffType == 1 && year == 2020) {	// 2W/r  	4-team		6-team		8-team
            if(numPOTeams == 6) {						// last:	1, 2		1, 2		1, 2, 3, 4	
                playoffLength = 6;						// 2-last:	1, 2		1, 2		1, 2, 3, 4	
                playoffCase = 7;						// 3-last:	1, 2		1, 2, 3 	1, 2, 3, 4
            } else if (numPOTeams == 8) {				// 4-last: 	1, 2		1, 2, 3		1, 2, 3, 4
                playoffLength = 6;						// 5-last:				1, 2		1, 2, 3, 4
                playoffCase = 8;						// 6-last:				1, 2		1, 2, 3, 4
            } else if (numPOTeams == 4) {
                playoffLength = 4;
                playoffCase = 9;
            }
        }

        let recordsWeek = playoffStart + playoffLength - 1;

        // on first run, week is provided above from nflState,
        // after that get the final week of playoffs from leagueData
        if(leagueData.status == 'complete') week = playoffStart + playoffLength - 1;
        lastYear = year;

        const rosters = rosterRes.rosters;
        const numSeasonManagers = rosters.length;

        // ACQUISITION (TRANSACTION) RECORD-BOOK
        acquisitionRecords[year] = {};
        for(const roster of rosters) {
            const rosterID = roster.roster_id;		

            const recordManager = leagueManagers[rosterID].find(m => m.yearsactive.includes(year));
            const recordManrosterID = recordManager.rosterID;
            const recordManID = recordManager.managerID;
            
            const draftResults = draftInfo[year].draft;
            const totalPicks = draftResults.length * draftResults[0].length;
            for(let r = 0; r < draftResults.length; r++) {

                for(const pick of draftResults[r]) {
                    const draftPick = pick.player;

                    if(draftPick.rosterID == recordManrosterID) {

                        if(!acquisitionRecords[year][recordManID]) {
                            acquisitionRecords[year][recordManID] = {};
                            for(const transType of transTypes) {
                                acquisitionRecords[year][recordManID][transType] = {
                                    players: [],
                                    totals: {
                                        numAdded: 0,
                                    },
                                    positions: {},
                                }
                                if((transType == 'waiver' && faabWaivers) || (transType == 'draft' && draftPick.amount)) acquisitionRecords[year][recordManID][transType].totals.faabSpent = 0;
                                if(transType == 'trade') acquisitionRecords[year][recordManID][transType].totals.numDropped = 0;
                                if(transType == 'draft' && draftPick.pick) acquisitionRecords[year][recordManID][transType].totals.picks = [];
                                if(transType == 'waiver' && faabWaivers) {
                                    acquisitionRecords[year][recordManID][transType].totals.budgetPercs = {
                                        remaining: 0,
                                        total: 0,
                                    }
                                }
                                for(const position of rosterPositions.years[year]) {
                                    acquisitionRecords[year][recordManID][transType].positions[position] = {
                                        numAdded: 0,
                                    }
                                    if((transType == 'waiver' && faabWaivers) || (transType == 'draft' && draftPick.amount)) acquisitionRecords[year][recordManID][transType].positions[position].faabSpent = 0;
                                    if(transType == 'draft' && draftPick.pick) acquisitionRecords[year][recordManID][transType].positions[position].picks = [];
                                    if(transType == 'trade') acquisitionRecords[year][recordManID][transType].positions[position].numDropped = 0;
                                    if(transType == 'waiver' && faabWaivers) {
                                        acquisitionRecords[year][recordManID][transType].positions[position].budgetPercs = {
                                            remaining: 0,
                                            total: 0,
                                        }
                                    }
                                }
                            }
                        }
                        const pos = playersInfo[draftPick.playerID].pos == 'FB' ? 'RB' : playersInfo[draftPick.playerID].pos;
                        acquisitionRecords[year][recordManID].draft.totals.numAdded++;
                        acquisitionRecords[year][recordManID].draft.positions[pos].numAdded++;
                        if(draftPick.pick) {
                            acquisitionRecords[year][recordManID].draft.positions[pos].picks.push(draftPick.pick);
                            acquisitionRecords[year][recordManID].draft.totals.picks.push(draftPick.pick);
                        }
                        // record first drafted player at each position
                        if(!acquisitionRecords[year][recordManID].draft.positions[pos].firstAdd) {
                            acquisitionRecords[year][recordManID].draft.positions[pos].firstAdd = {
                                playerID: draftPick.playerID,
                                round: draftPick?.round || null,
                                pick: draftPick?.pick || null,
                                price: draftPick?.amount || 1 - draftPick.pick / totalPicks,
                            }
                        }
                        if(draftPick.amount) {
                            acquisitionRecords[year][recordManID].draft.totals.faabSpent += draftPick.amount;
                            acquisitionRecords[year][recordManID].draft.positions[pos].faabSpent += draftPick.amount;
                        }

                        acquisitionRecords[year][recordManID].draft.players.push({
                            playerID: draftPick.playerID,
                            addWeek: 0,
                            dropWeek: null,
                            round: draftPick?.round || null,
                            pick: draftPick?.pick || null,
                            price: draftPick?.amount || 1 - draftPick.pick / totalPicks,
                        });
                    }
                }
            }
            if(acquisitionRecords[year][recordManID].draft.totals.picks) acquisitionRecords[year][recordManID].draft.totals.pickAvg = acquisitionRecords[year][recordManID].draft.totals.picks.reduce((a, b) => a + b) / acquisitionRecords[year][recordManID].draft.totals.picks.length;
            if(auctionDraft) acquisitionRecords[year][recordManID].draft.totals.faabAvg = acquisitionRecords[year][recordManID].draft.totals.faabSpent / acquisitionRecords[year][recordManID].draft.totals.numAdded;

            for(const transType of transTypes) {
                if(transType == 'totals' || transType == 'draft') continue;
                for(const transaction of transactionsInfo.years[year][transType]) {

                    if(transaction.moves[0][0].asset == 'player') {

                        if((transType == 'freeAgent' || transType == 'waiver') && transaction.recordManIDs[0] == recordManID) {

                            for(const move of transaction.moves) {

                                if(move[0].type == 'Added') {
                                    const pos = playersInfo[move[0].player].pos == 'FB' ? 'RB' : playersInfo[move[0].player].pos;
                                    acquisitionRecords[year][recordManID][transType].totals.numAdded++;
                                    acquisitionRecords[year][recordManID][transType].positions[pos].numAdded++;
                                    if(transType == 'waiver' && faabWaivers) {
                                        acquisitionRecords[year][recordManID][transType].totals.faabSpent += move[0].bid;
                                        acquisitionRecords[year][recordManID][transType].positions[pos].faabSpent += move[0].bid;
                                        for(const key in acquisitionRecords[year][recordManID][transType].totals.budgetPercs) {
                                            acquisitionRecords[year][recordManID][transType].totals.budgetPercs[key] += move[0].budgetPercs[key];
                                            acquisitionRecords[year][recordManID][transType].positions[pos].budgetPercs[key] += move[0].budgetPercs[key];
                                        }
                                    }
                                    
                                    acquisitionRecords[year][recordManID][transType].players.push({
                                        playerID: move[0].player,
                                        addWeek: transaction.week,
                                        dropWeek: null,
                                        price: transType == 'waiver' && faabWaivers ? move[0].bid : null,
                                    });
                                } else if(move[0].type == 'Dropped') {            

                                    for(const transType in acquisitionRecords[year][recordManID]) {

                                        if(acquisitionRecords[year][recordManID][transType].players.find(a => a.playerID == move[0].player) && acquisitionRecords[year][recordManID][transType].players.find(a => a.playerID == move[0].player).dropWeek == null) {
                                            acquisitionRecords[year][recordManID][transType].players.find(a => a.playerID == move[0].player).dropWeek = transaction.week;
                                            break;
                                        }
                                    }
                                }
                            }

                        } else if(transType == 'trade' && transaction.moves.some(m => m.find(n => n.rosterID == recordManrosterID))) {
                            
                            for(const move of transaction.moves) {

                                if(move.find(m => m.side == 'destination').rosterID == recordManrosterID) {

                                    acquisitionRecords[year][recordManID][transType].totals.numAdded++;

                                    acquisitionRecords[year][recordManID][transType].players.push({
                                        playerID: move.find(m => m.side == 'destination').player,
                                        addWeek: transaction.week,
                                        dropWeek: null,
                                    });
                                } else if(move.find(m => m.side == 'origin').rosterID == recordManrosterID) {

                                    const dropID = move.find(m => m.side == 'origin').player;
                                    acquisitionRecords[year][recordManID][transType].totals.numDropped++;
                                    
                                    for(const transType in acquisitionRecords[year][recordManID]) {

                                        if(acquisitionRecords[year][recordManID][transType].players.find(a => a.playerID == dropID) && acquisitionRecords[year][recordManID][transType].players.find(a => a.playerID == dropID).dropWeek == null) {
                                            acquisitionRecords[year][recordManID][transType].players.find(a => a.playerID == dropID).dropWeek = transaction.week;
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                if(transType == 'waiver' && faabWaivers) {
                    acquisitionRecords[year][recordManID][transType].totals.faabAvg = acquisitionRecords[year][recordManID][transType].totals.faabSpent / acquisitionRecords[year][recordManID][transType].totals.numAdded;
                    for(const key in acquisitionRecords[year][recordManID][transType].totals.budgetPercs) {
                        acquisitionRecords[year][recordManID][transType].totals.budgetPercs[`${key}Avg`] = acquisitionRecords[year][recordManID][transType].totals.budgetPercs[key] / acquisitionRecords[year][recordManID][transType].totals.numAdded;
                    }
                }
            }
            // calculate cumulative transaction stats
            for(const transType of transTypes) {
                if(transType == 'freeAgent' || transType == 'trade' || (transType == 'waiver' && !faabWaivers) || (transType == 'draft' && !auctionDraft && !acquisitionRecords[year][recordManID].draft.totals.picks)) continue;
                for(const position of rosterPositions.years[year]) {
                    if((transType == 'waiver' && faabWaivers) || (transType == 'draft' && auctionDraft)) acquisitionRecords[year][recordManID][transType].positions[position].faabAvg = acquisitionRecords[year][recordManID][transType].positions[position].faabSpent / acquisitionRecords[year][recordManID][transType].positions[position].numAdded;
                    if(transType == 'draft' && acquisitionRecords[year][recordManID][transType].totals.picks) {
                        acquisitionRecords[year][recordManID][transType].positions[position].pickAvg = acquisitionRecords[year][recordManID][transType].positions[position].picks.reduce((a, b) => a + b, 0) / acquisitionRecords[year][recordManID][transType].totals.picks.length;
                    } else {
                        for(const key in  acquisitionRecords[year][recordManID][transType].positions[position].budgetPercs) {
                            acquisitionRecords[year][recordManID][transType].positions[position].budgetPercs[`${key}Avg`] =  acquisitionRecords[year][recordManID][transType].positions[position].budgetPercs[key] /  acquisitionRecords[year][recordManID][transType].positions[position].numAdded;
                        }
                    }
                }
            }
        }

        const originalManagers = {};
    
        for(const roster of rosters) {
            const rosterID = roster.roster_id;
            const user = users[roster.owner_id];
            
            const recordManager = leagueManagers[rosterID].find(m => m.yearsactive.includes(year));
            const recordManID = recordManager.managerID;

            if(user) {
                originalManagers[recordManID] = {
                    avatar: user.avatar != null ? `https://sleepercdn.com/avatars/thumbs/${user.avatar}` : `https://sleepercdn.com/images/v2/icons/player_default.webp`,
                    name: user.metadata.team_name ? user.metadata.team_name : user.display_name,
                    realname: recordManager.name,
                    rosterID,
                    recordManID,
                };
            } else {
                originalManagers[recordManID] = {
                    avatar: `https://sleepercdn.com/images/v2/icons/player_default.webp`,
                    name: 'Unknown Manager',
                    realname: 'John Q. Rando',
                    rosterID,
                    recordManID,
                };
            }

            if(!allManagers[recordManID]) allManagers[recordManID] = originalManagers[recordManID];

            // LONGEST STREAK UNDER CONSTRUCTION
            // const findMaximumRepeating = str => {
            // 	let max = 0;
            // 	let othermax = 0;
            // 	let maxtype = null;
            // 	let othermaxtype = null;
            // 	let streaks = {
            // 		maxarray: [],
            // 		typearray: [],
            // 	};
            // 	for(let start = 0, end = 1; end < str.length; ) {
            // 	   	if(str[end] === str[start]) {
            // 		  	if(max < end - start + 1) {
            // 				max = end - start + 1;
            // 				maxtype = str[end];
            // 		 	} else if((max === end - start + 1 || max > end - start + 1) && end - start + 1 > othermax) {
            // 				othermax = end - start + 1;
            // 			};
            // 		  	end++;
            // 	   	} else {
            // 			if(othermax === 0) {
            // 				othermax = 1;
            // 				othermaxtype = 
            // 			}
            // 			streaks.maxarray.push(max);
            // 			streaks.typearray.push(str[start]);
            // 		  	start = end;
            // 	   	};
            // 	};
            // 	return {
            // 		max,
            // 		maxtype,
            // 	}
            //  };

            // let regSeasonStreak = null;
            // const regSeasonRecord = roster.metadata.record;
            // if(typeof regSeasonRecord !== 'undefined') {
            // 	regSeasonStreak = findMaximumRepeating(regSeasonRecord);
            // }
                
        }

        // loop through each week of the season
        const matchupsPromises = [];
        while(recordsWeek > 0) {
            matchupsPromises.push(fetch(`https://api.sleeper.app/v1/league/${curSeason}/matchups/${recordsWeek}`, {compress: true}))
            recordsWeek--;
        }

        const matchupsRes = await waitForAll(...matchupsPromises).catch((err) => { console.error(err); });

        // convert the json matchup responses
            //regular season
        const matchupsJsonPromises = [];
        for(const matchupRes of matchupsRes) {
            const data = matchupRes.json();
            matchupsJsonPromises.push(data)
            if (!matchupRes.ok) throw new Error(data);
        }
        const matchupsData = await waitForAll(...matchupsJsonPromises).catch((err) => { console.error(err); });

        // now that we've used the current season ID for everything we need, set it to the previous season
        curSeason = leagueData.previous_league_id;

        for(const matchupWeek of matchupsData) {
            const matchups = {};
            const POround = week - playoffStart + 1;

            for(const matchup of matchupWeek) {
                if(week < playoffStart 
                    ||
                    (matchup.matchup_id && matchup.matchup_id == 1 &&
                        ((playoffCase == 4 && week == playoffStart - 1 + playoffLength) ||     
                        (playoffCase == 5 && week == playoffStart - 1 + playoffLength) ||
                        (playoffCase == 6 && week == playoffStart - 1 + playoffLength))) 
                    ||
                    (matchup.matchup_id && matchup.matchup_id < 3 &&
                        (playoffCase == 3 ||														
                        playoffCase == 9 ||
                        (playoffCase == 6 && week < playoffStart - 1 + playoffLength) ||
                        (playoffCase == 1 && POround != 2) ||
                        (playoffCase == 4 && POround == 1) ||
                        (playoffCase == 4 && POround == 3) ||
                        (playoffCase == 7 && POround < 3) ||
                        (playoffCase == 7 && POround > 4)))
                    ||
                    (matchup.matchup_id && matchup.matchup_id < 4 && 
                        ((playoffCase == 7 && 2 < POround && POround < 5) ||									
                        (playoffCase == 4 && POround == 2) ||
                        (playoffCase == 1 && POround == 2)))
                    ||
                    (matchup.matchup_id && matchup.matchup_id < 5 &&
                        (playoffCase == 8 ||														
                        playoffCase == 2 ||
                        (playoffCase == 5 && week < playoffStart - 1 + playoffLength)))
                    ) {

                    const recordManID = leagueManagers[matchup.roster_id].find(m => m.yearsactive.includes(year)).managerID;
                    // add each entry to the matchup object
                    if(!matchups[matchup.matchup_id]) matchups[matchup.matchup_id] = [];
                    matchups[matchup.matchup_id].push({
                        manager: originalManagers[recordManID],
                        fpts: matchup.points,
                        starters_points: matchup.starters_points,
                        players_points: matchup.players_points,
                        starters: matchup.starters,
                        players: matchup.players,
                        rosterID: matchup.roster_id,
                        recordManID,
                    });
                }
            }
            for(const matchupKey in matchups) {
                const matchup = matchups[matchupKey];
                let home = matchup[0];
                let away = matchup[1];
                if(matchup[0].fpts < matchup[1].fpts) {
                    home = matchup[1];
                    away = matchup[0];
                }

                for(const opponent of matchup) {

                    let totalFpts = 0;
                    for(const key in opponent.players_points) {
                        totalFpts += opponent.players_points[key];
                    }
                    const comboEntry = {
                        manager: opponent.manager,
                        recordManID: opponent.recordManID,
                        rosterID: opponent.rosterID,
                        fpts: {
                            starters: {
                                real: opponent.fpts,
                                proj: 0,
                                poss: 0,
                            },
                            bench: {
                                real: totalFpts - opponent.fpts,
                                proj: 0,
                            },
                            total: {
                                real: totalFpts,
                                proj: 0,
                            },
                            opp: {
                                real: home.fpts == away.fpts || opponent == home ? away.fpts : home.fpts,
                            },
                        },
                        outcomes: {
                            match: home.fpts == away.fpts ? 'T' : opponent == home ? 'W' : 'L',
                        },
                        oppManager: opponent.recordManID == home.recordManID ? away.manager : home.manager,
                        oppRecordManID: opponent.recordManID == home.recordManID ? away.recordManID : home.recordManID,
                        matchDifferential: home.fpts != away.fpts && opponent == away ? (home.fpts - away.fpts) * (-1) : home.fpts - away.fpts,
                        period: week < playoffStart ? 'regular' : 'playoffs',
                        week,
                        year,
                        matchupInfo: {
                            info: matchup,
                            positions: rosterSpots,
                            starters: [],
                            bench: [],
                        },
                    }

                    const starters = opponent.starters;
                    const startersPTS = opponent.starters_points.sort((a, b) => b - a);		
                    const players = opponent.players;
                    const optimalPlayers = [];
                    const optimalProjections = [];

                    for(let i = 0; i < players.length; i++) {
    
                        const playerID = players[i];
                        const playerPoints = opponent.players_points[playerID];
                        const nflInfo = nflPlayerInfo[playerID] ? nflPlayerInfo[playerID] : nflPlayerInfo2[playerID];
                        optimalPlayers.push({
                            pos: playersInfo[playerID].pos == 'FB' ? 'RB' : playersInfo[playerID].pos,
                            fpts: playerPoints,
                        })
                        // nullifyProj tells the optimal projection function to just return the player's actual points-scored if Sleeper doesn't have their projection stats but nevertheless records them as scoring
                        // i.e. accounting for the 2019 "OAK" problem
                        optimalProjections.push({
                            pos: playersInfo[playerID].pos == 'FB' ? 'RB' : playersInfo[playerID].pos,
                            wi: playersInfo[playerID]?.wi || null,
                            nullifyProj: playerPoints != 0 && (!playersInfo[playerID].wi[year] || !playersInfo[playerID].wi[year][week] || playersInfo[playerID].wi[year][week] == 0) ? playerPoints : null,
                        })

                        const playerEntry = {		
                            recordManID: opponent.recordManID,
                            manager: originalManagers[opponent.recordManID],
                            period: week < playoffStart ? 'regular' : 'playoffs',
                            week,
                            year,
                            rosterID: opponent.rosterID,
                            playerID,
                            projFpts: playersInfo[playerID].wi[year] && playersInfo[playerID].wi[year][week] ? parseFloat(playersInfo[playerID].wi[year][week].p) : 0,
                            nullifyProj: playerPoints != 0 && (!playersInfo[playerID].wi[year] || !playersInfo[playerID].wi[year][week] || playersInfo[playerID].wi[year][week] == 0) ? true : false,
                            projDiff: playersInfo[playerID].wi[year] && playersInfo[playerID].wi[year][week] && playersInfo[playerID].wi[year][week] != 0 ? playerPoints - playersInfo[playerID].wi[year][week].p : 0,
                            projResult: playersInfo[playerID].wi[year] && playersInfo[playerID].wi[year][week] && playersInfo[playerID].wi[year][week] != 0 && playerPoints - playersInfo[playerID].wi[year][week].p > 0 ? true : playersInfo[playerID].wi[year] && playersInfo[playerID].wi[year][week] && playersInfo[playerID].wi[year][week] != 0 &&  playerPoints - playersInfo[playerID].wi[year][week].p < 0 ? false : 'equal',
                            fpts: playerPoints,
                            benched: starters.includes(playerID) ? false : true,
                            topStarter: starters.includes(playerID) && startersPTS[0] == playerPoints ? true : false,
                            bottomStarter: starters.includes(playerID) && startersPTS[startersPTS.length - 1] == playerPoints ? true : false,
                            starterRank: starters.includes(playerID) ? startersPTS.indexOf(playerPoints) + 1 : null,
                            numStarters: opponent.starters_points.length,
                            playerInfo: playersInfo[playerID],
                            nflInfo,
                            avatar: playersInfo[playerID].pos == "DEF" ? `https://sleepercdn.com/images/team_logos/nfl/${playerID.toLowerCase()}.png` : `https://sleepercdn.com/content/nfl/players/thumb/${playerID}.jpg`,
                            rosterSpot: starters.includes(playerID) ? rosterSpots[starters.indexOf(playerID)] : null,
                            team: playersInfo[playerID].pos == 'DEF' ? playerID : nflInfo && nflInfo.espn.t[year].length > 1 && nflInfo.espn.t[year].find(w => w.firstWeek <= week && w.lastWeek >= week) ? nflTeams.find(n => n.espnAbbreviation == nflInfo.espn.t[year].find(w => w.firstWeek <= week && w.lastWeek >= week).team).sleeperID : playersInfo[playerID].wi[year][week] && playersInfo[playerID].wi[year][week].t ? playersInfo[playerID].wi[year][week].t : playersInfo[playerID].wi[year][1] && playersInfo[playerID].wi[year][1].t ? playersInfo[playerID].wi[year][1].t : nflInfo ? nflTeams.find(n => n.espnAbbreviation == nflInfo.espn.t[year][0]).sleeperID : 'NONE',
                        }
                        const acquisitions = acquisitionRecords[year][opponent.recordManID];
                        for(const transType in acquisitions) {
                            const playerTrans = acquisitions[transType].players.filter(a => a.playerID == playerID);
                            
                            if(playerTrans?.find(t => t.addWeek <= week && (week <= t.dropWeek || t.dropWeek == null))) {
                                playerEntry.howAcquired = transType;
                                playerEntry.price = transType == 'waiver' || transType == 'draft' ? playerTrans.find(t => t.addWeek <= week && (week <= t.dropWeek || t.dropWeek == null)).price : null;
                                break;
                            } 
                        }

                        comboEntry.fpts.total.proj += playerEntry.nullifyProj ? playerEntry.fpts : playerEntry.projFpts;
                        // add playerEntry to comboEntry
                        if(playerEntry.benched == false) {
                            comboEntry.matchupInfo.starters[starters.indexOf(playerID)] = playerEntry;
                            comboEntry.fpts.starters.proj += playerEntry.nullifyProj ? playerEntry.fpts : playerEntry.projFpts;
                        } else {
                            comboEntry.matchupInfo.bench.push(playerEntry);
                            comboEntry.fpts.bench.proj += playerEntry.nullifyProj ? playerEntry.fpts : playerEntry.projFpts;
                        }

                        masterRecordBook.weeks.players.push(playerEntry);
                    }
                    comboEntry.fpts.starters.diff = comboEntry.fpts.starters.real - comboEntry.fpts.starters.proj;
                    comboEntry.fpts.bench.diff = comboEntry.fpts.bench.real - comboEntry.fpts.bench.proj;
                    comboEntry.projResult = comboEntry.fpts.starters.diff > 0 ? true : comboEntry.fpts.starters.diff < 0 ? false : 'equal';
                    comboEntry.fpts.starters.poss = predictScores(optimalPlayers, week, leagueData, 'result');
                    comboEntry.optimalProj = predictScores(optimalProjections, week, leagueData, 'projection');
                    comboEntry.beatOptProj = comboEntry.fpts.starters.diff > comboEntry.optimalProj - comboEntry.fpts.starters.proj ? true : comboEntry.fpts.starters.diff < comboEntry.optimalProj - comboEntry.fpts.starters.proj ? false : 'equal';
                    comboEntry.iq = comboEntry.fpts.starters.real / comboEntry.fpts.starters.poss * 100;
                    comboEntry.perfect = comboEntry.fpts.starters.real == comboEntry.fpts.starters.poss ? true : false;
                    comboEntry.outcomes.uni = comboEntry.fpts.starters.poss > comboEntry.fpts.opp.real ? 'W' : comboEntry.fpts.starters.poss == comboEntry.fpts.opp.real ? 'T' : 'L';
                    // compare projected & optimal scores of both managers in matchup
                    if(matchup.indexOf(opponent) == 1) {
                        masterRecordBook.weeks.managers[masterRecordBook.weeks.managers.length - 1].fpts.opp.poss = comboEntry.fpts.starters.poss;
                        comboEntry.fpts.opp.poss = masterRecordBook.weeks.managers[masterRecordBook.weeks.managers.length - 1].fpts.starters.poss;
                        if(comboEntry.fpts.starters.poss > comboEntry.fpts.opp.poss) {
                            comboEntry.outcomes.bball = 'W';
                            masterRecordBook.weeks.managers[masterRecordBook.weeks.managers.length - 1].outcomes.bball = 'L';
                        } else if(comboEntry.fpts.starters.poss < comboEntry.fpts.opp.poss) {
                            comboEntry.outcomes.bball = 'L';
                            masterRecordBook.weeks.managers[masterRecordBook.weeks.managers.length - 1].outcomes.bball = 'W';
                        } else {
                            comboEntry.outcomes.bball = 'T';
                            masterRecordBook.weeks.managers[masterRecordBook.weeks.managers.length - 1].outcomes.bball = 'T';
                        }
                        masterRecordBook.weeks.managers[masterRecordBook.weeks.managers.length - 1].fpts.opp.proj = comboEntry.fpts.starters.proj;
                        masterRecordBook.weeks.managers[masterRecordBook.weeks.managers.length - 1].projMargin = masterRecordBook.weeks.managers[masterRecordBook.weeks.managers.length - 1].fpts.starters.proj - comboEntry.fpts.starters.proj;
                        comboEntry.fpts.opp.proj = masterRecordBook.weeks.managers[masterRecordBook.weeks.managers.length - 1].fpts.starters.proj;
                        comboEntry.projMargin = comboEntry.fpts.starters.proj - comboEntry.fpts.opp.proj;
                        if(comboEntry.projMargin > 0) {
                            masterRecordBook.weeks.managers[masterRecordBook.weeks.managers.length - 1].outcomes.iq = 'L';
                            comboEntry.outcomes.iq = 'W';
                            if(comboEntry.outcomes.match == 'W') {
                                masterRecordBook.weeks.managers[masterRecordBook.weeks.managers.length - 1].outcomes.upsets = false;
                                comboEntry.outcomes.upsets = false;
                            } else if(comboEntry.outcomes.match == 'L') {
                                masterRecordBook.weeks.managers[masterRecordBook.weeks.managers.length - 1].outcomes.upsets = 'W';
                                comboEntry.outcomes.upsets = 'L';
                            }
                        } else if(comboEntry.projMargin < 0) {
                            masterRecordBook.weeks.managers[masterRecordBook.weeks.managers.length - 1].outcomes.iq = 'W';
                            comboEntry.outcomes.iq = 'L';
                            if(comboEntry.outcomes.match == 'W') {
                                masterRecordBook.weeks.managers[masterRecordBook.weeks.managers.length - 1].outcomes.upsets = 'L';
                                comboEntry.outcomes.upsets = 'W';
                            } else if(comboEntry.outcomes.match == 'L') {
                                masterRecordBook.weeks.managers[masterRecordBook.weeks.managers.length - 1].outcomes.upsets = false;
                                comboEntry.outcomes.upsets = false;
                            }
                        } else {
                            masterRecordBook.weeks.managers[masterRecordBook.weeks.managers.length - 1].outcomes.iq = 'T';
                            comboEntry.outcomes.iq = 'T';
                            if(comboEntry.outcomes.match == 'W') {
                                masterRecordBook.weeks.managers[masterRecordBook.weeks.managers.length - 1].outcomes.upsets = 'TL';
                                comboEntry.outcomes.upsets = 'TW';
                            } else if(comboEntry.outcomes.match == 'L') {
                                masterRecordBook.weeks.managers[masterRecordBook.weeks.managers.length - 1].outcomes.upsets = 'TW';
                                comboEntry.outcomes.upsets = 'TL';
                            }
                        }
                    }

                    masterRecordBook.weeks.managers.push(comboEntry);
                }
            }
            week--;
        }

        for(const recordPeriod of recordPeriods) {

            if(!masterRecordBook.seasons.players[recordPeriod]) {
                masterRecordBook.seasons.players[recordPeriod] = [];
                masterRecordBook.seasons.managers[recordPeriod] = [];

                headToHeadRecords[recordPeriod] = {
                    alltime: {},
                    years: {},
                }
            }
            headToHeadRecords[recordPeriod].years[year] = {};

            for(const recordManID in allManagers) {

                if(!headToHeadRecords[recordPeriod].alltime[recordManID]) headToHeadRecords[recordPeriod].alltime[recordManID] = {};
                for(const otherManager in allManagers) {
                    if(otherManager != recordManID  && !headToHeadRecords[recordPeriod].alltime[recordManID][otherManager]) {
                        headToHeadRecords[recordPeriod].alltime[recordManID][otherManager] = {
                            fpts: {
                                pos: {},
                                trans: {},
                            },
                            outcomes: {},
                            margins: {},
                            oppRecordManID: otherManager,
                            oppManager: allManagers[otherManager],
                            matchups: [],
                        }
                        for(const recordType of recordTypes) {
                            headToHeadRecords[recordPeriod].alltime[recordManID][otherManager].outcomes[recordType] = {};
                            if(recordType.includes('EPE')) {
                                headToHeadRecords[recordPeriod].alltime[recordManID][otherManager].outcomes[recordType].top = 0;
                                headToHeadRecords[recordPeriod].alltime[recordManID][otherManager].outcomes[recordType].bottom = 0;
                            };
                            for(const outcomeType of outcomeTypes) {
                                if(outcomeType == 'T' && (recordType == 'uni' || recordType == 'upsets')) continue;
                                headToHeadRecords[recordPeriod].alltime[recordManID][otherManager].outcomes[recordType][outcomeType] = 0;
                            }
                        }
                        for(const playerType of playerTypes) {
                            headToHeadRecords[recordPeriod].alltime[recordManID][otherManager].fpts[playerType] = {
                                real: 0,
                                proj: 0,
                            }
                            if(playerType == 'starters' || playerType == 'opp') headToHeadRecords[recordPeriod].alltime[recordManID][otherManager].fpts[playerType].poss = 0;
                        
                            for(const position of rosterPositions.alltime) {
                                if(!headToHeadRecords[recordPeriod].alltime[recordManID][otherManager].fpts.pos[position]) headToHeadRecords[recordPeriod].alltime[recordManID][otherManager].fpts.pos[position] = {};
                                headToHeadRecords[recordPeriod].alltime[recordManID][otherManager].fpts.pos[position][playerType] = {
                                    real: 0,
                                    proj: 0,
                                    weeks: 0,
                                }
                            }
                            for(const transType of transTypes) {
                                if(!headToHeadRecords[recordPeriod].alltime[recordManID][otherManager].fpts.trans[transType]) headToHeadRecords[recordPeriod].alltime[recordManID][otherManager].fpts.trans[transType] = {};
                                headToHeadRecords[recordPeriod].alltime[recordManID][otherManager].fpts.trans[transType][playerType] = {
                                    real: 0,
                                    proj: 0,
                                    weeks: 0,
                                }
                            }
                        }
                    }
                }
            }
            if((recordPeriod != 'playoffs' || masterRecordBook.weeks.managers.find(w => w.week >= playoffStart)) && Object.keys(headToHeadRecords[recordPeriod].years[year]).length == 0) {
                for(const recordManID in originalManagers) {

                    headToHeadRecords[recordPeriod].years[year][recordManID] = {};

                    for(const otherManager in originalManagers) {
                        if(otherManager != recordManID) {
                            headToHeadRecords[recordPeriod].years[year][recordManID][otherManager] = {
                                fpts: {
                                    pos: {},
                                    trans: {},
                                },
                                outcomes: {},
                                margins: {},
                                oppRecordManID: otherManager,
                                oppManager: originalManagers[otherManager],
                                matchups: [],
                            }
                            for(const recordType of recordTypes) {
                                headToHeadRecords[recordPeriod].years[year][recordManID][otherManager].outcomes[recordType] = {};
                                if(recordType.includes('EPE')) {
                                    headToHeadRecords[recordPeriod].years[year][recordManID][otherManager].outcomes[recordType].top = 0;
                                    headToHeadRecords[recordPeriod].years[year][recordManID][otherManager].outcomes[recordType].bottom = 0;
                                };
                                for(const outcomeType of outcomeTypes) {
                                    if(outcomeType == 'T' && (recordType == 'upsets')) continue;
                                    headToHeadRecords[recordPeriod].years[year][recordManID][otherManager].outcomes[recordType][outcomeType] = 0;
                                }
                            }
                            for(const playerType of playerTypes) {
                                headToHeadRecords[recordPeriod].years[year][recordManID][otherManager].fpts[playerType] = {
                                    real: 0,
                                    proj: 0,
                                }
                                if(playerType == 'starters' || playerType == 'opp') headToHeadRecords[recordPeriod].years[year][recordManID][otherManager].fpts[playerType].poss = 0;
                            
                                for(const position of rosterPositions.years[year]) {
                                    if(!headToHeadRecords[recordPeriod].years[year][recordManID][otherManager].fpts.pos[position]) headToHeadRecords[recordPeriod].years[year][recordManID][otherManager].fpts.pos[position] = {};
                                    headToHeadRecords[recordPeriod].years[year][recordManID][otherManager].fpts.pos[position][playerType] = {
                                        real: 0,
                                        proj: 0,
                                        weeks: 0,
                                    }
                                }
                                for(const transType of transTypes) {
                                    if(!headToHeadRecords[recordPeriod].years[year][recordManID][otherManager].fpts.trans[transType]) headToHeadRecords[recordPeriod].years[year][recordManID][otherManager].fpts.trans[transType] = {};
                                    headToHeadRecords[recordPeriod].years[year][recordManID][otherManager].fpts.trans[transType][playerType] = {
                                        real: 0,
                                        proj: 0,
                                        weeks: 0,
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if(recordPeriod != 'playoffs' || masterRecordBook.weeks.managers.find(w => w.week >= playoffStart)) {
                for(const recordManID in originalManagers) {
                    let recordMan = masterRecordBook.weeks.managers.filter(w => w.recordManID == recordManID && w.year == year);
                    let recordPlayer = masterRecordBook.weeks.players.filter(w => w.recordManID == recordManID && w.year == year);
                    if(recordPeriod == 'regular') {
                        recordMan = recordMan.filter(w => w.period == 'regular');
                        recordPlayer = recordPlayer.filter(w => w.period == 'regular');
                    } else if(recordPeriod == 'playoffs') {
                        recordMan = recordMan.filter(w => w.period == 'playoffs');
                        recordPlayer = recordPlayer.filter(w => w.period == 'playoffs');
                    }
                    if(recordMan.length == 0) continue;

                    const comboEntry = {
                        manager: originalManagers[recordManID],
                        recordManID,
                        rosterID: recordMan[0].rosterID,
                        fpts: {
                            pos: {},
                            trans: {},
                            transPos: {},
                        },
                        outcomes: {},
                        margins: {
                            median: {},
                        },
                        optimalProj: 0,
                        beatOptProj: 0,
                        beatProj: 0,
                        perfects: 0,
                        year,
                    }
                    for(const recordType of recordTypes) {
                        comboEntry.outcomes[recordType] = {};
                        if(recordType.includes('EPE')) {
                            comboEntry.outcomes[recordType].top = 0;
                            comboEntry.outcomes[recordType].bottom = 0;
                        };
                        for(const outcomeType of outcomeTypes) {
                            if(outcomeType == 'T' && recordType == 'upsets') continue;
                            comboEntry.outcomes[recordType][outcomeType] = 0;
                        }
                    }
                    for(const playerType of playerTypes) {
                        comboEntry.fpts[playerType] = {
                            real: 0,
                            proj: 0,
                        }
                        if(playerType == 'starters' || playerType == 'opp') comboEntry.fpts[playerType].poss = 0;

                        for(const transType of transTypes) {
                            if(!comboEntry.fpts.trans[transType]) {
                                comboEntry.fpts.trans[transType] = {};
                                comboEntry.fpts.transPos[transType] = {};
                            } 
                            comboEntry.fpts.trans[transType][playerType] = {
                                real: 0,
                                proj: 0,
                                weeks: 0,
                            }
                        }

                        for(const position of rosterPositions.years[year]) {
                            if(!comboEntry.fpts.pos[position]) {
                                comboEntry.fpts.pos[position] = {};
                                for(const transType of transTypes) {
                                    comboEntry.fpts.transPos[transType][position] = {};
                                }
                            }
                            comboEntry.fpts.pos[position][playerType] = {
                                real: 0,
                                proj: 0,
                                weeks: 0,
                            }
                            for(const transType of transTypes) {
                                comboEntry.fpts.transPos[transType][position][playerType] = {
                                    real: 0,
                                    proj: 0,
                                    weeks: 0,
                                }
                            }
                        }
                    }
                    // looping thru each week in that year
                    for(let i = 0; i < recordMan.length; i++) {

                        // add each week's starter & bench scores to acquisition & position totals
                        for(const key in recordMan[i].matchupInfo) {
                            if(key == 'info' || key == 'positions') continue;

                            for(const player of recordMan[i].matchupInfo[key]) {
                                if(!player) continue;
                                const pos = player.playerInfo.pos == 'FB' ? 'RB' : player.playerInfo.pos;
                                for(const score in comboEntry.fpts.pos[pos][key]) {
                                    comboEntry.fpts.pos[pos][key][score] += score == 'weeks' ? 1 : score == 'real' ? player.fpts : player.projFpts;
                                    comboEntry.fpts.pos[pos].total[score] += score == 'weeks' ? 1 : score == 'real' ? player.fpts : player.projFpts;
                                    comboEntry.fpts.trans[player.howAcquired][key][score] += score == 'weeks' ? 1 : score == 'real' ? player.fpts : player.projFpts;
                                    comboEntry.fpts.trans[player.howAcquired].total[score] += score == 'weeks' ? 1 : score == 'real' ? player.fpts : player.projFpts;
                                    comboEntry.fpts.transPos[player.howAcquired][pos][key][score] += score == 'weeks' ? 1 : score == 'real' ? player.fpts : player.projFpts;
                                    comboEntry.fpts.transPos[player.howAcquired][pos].total[score] += score == 'weeks' ? 1 : score == 'real' ? player.fpts : player.projFpts;
                                }
                            }
                        }

                        // add each week's score to running total & head-to-head totals
                        for(const playerType of playerTypes) {
                            for(const score in comboEntry.fpts[playerType]) {
                                comboEntry.fpts[playerType][score] += recordMan[i].fpts[playerType][score];
                                headToHeadRecords[recordPeriod].years[year][recordManID][recordMan[i].oppRecordManID].fpts[playerType][score] += recordMan[i].fpts[playerType][score];
                                headToHeadRecords[recordPeriod].alltime[recordManID][recordMan[i].oppRecordManID].fpts[playerType][score] += recordMan[i].fpts[playerType][score];
                            }
                        }

                        // add matchup entry to headToHeadRecords
                        headToHeadRecords[recordPeriod].alltime[recordManID][recordMan[i].oppRecordManID].matchups.push(recordMan[i]);
                        headToHeadRecords[recordPeriod].years[year][recordManID][recordMan[i].oppRecordManID].matchups.push(recordMan[i]);

                        // projection-related stats
                        if(recordMan[i].beatOptProj == true) comboEntry.beatOptProj++;
                        if(recordMan[i].projResult == true) comboEntry.beatProj++;
                        if(recordMan[i].perfect == true) comboEntry.perfects++;
                        comboEntry.optimalProj += recordMan[i].optimalProj;

                        // compare score to other scores from that week
                        const compares = {
                            EPE: {
                                W: masterRecordBook.weeks.managers.filter(w => w.week == recordMan[i].week && w.year == year && w.fpts.starters.real < recordMan[i].fpts.starters.real),
                                L: masterRecordBook.weeks.managers.filter(w => w.week == recordMan[i].week && w.year == year && w.fpts.starters.real > recordMan[i].fpts.starters.real),
                                T: masterRecordBook.weeks.managers.filter(w => w.week == recordMan[i].week && w.year == year && w.recordManID != recordMan[i].recordManID && w.fpts.starters.real == recordMan[i].fpts.starters.real),
                            },
                            iqEPE: {
                                W: masterRecordBook.weeks.managers.filter(w => w.week == recordMan[i].week && w.year == year && w.iq < recordMan[i].iq),
                                L: masterRecordBook.weeks.managers.filter(w => w.week == recordMan[i].week && w.year == year && w.iq > recordMan[i].iq),
                                T: masterRecordBook.weeks.managers.filter(w => w.week == recordMan[i].week && w.year == year && w.recordManID != recordMan[i].recordManID && w.iq == recordMan[i].iq),
                            },
                            bballEPE: {
                                W: masterRecordBook.weeks.managers.filter(w => w.week == recordMan[i].week && w.year == year && w.fpts.starters.poss < recordMan[i].fpts.starters.poss),
                                L: masterRecordBook.weeks.managers.filter(w => w.week == recordMan[i].week && w.year == year && w.fpts.starters.poss > recordMan[i].fpts.starters.poss),
                                T: masterRecordBook.weeks.managers.filter(w => w.week == recordMan[i].week && w.year == year && w.recordManID != recordMan[i].recordManID && w.fpts.starters.poss == recordMan[i].fpts.starters.poss),
                            },
                        }

                        // determine if beat median score & update that week's entry in masterRecordBook
                        const numScores = masterRecordBook.weeks.managers.filter(w => w.week == recordMan[i].week && w.year == recordMan[i].year).length;
                        const scoresArray = masterRecordBook.weeks.managers.filter(w => w.week == recordMan[i].week && w.year == recordMan[i].year).sort((a, b) => b.fpts.starters.real - a.fpts.starters.real).slice(numScores / 2 - 1, numScores / 2 + 1);
                        const medianScore = (scoresArray[0].fpts.starters.real + scoresArray[1].fpts.starters.real) / 2;
                        recordMan[i].outcomes.median = recordMan[i].fpts.starters.real > medianScore ? 'W' : recordMan[i].fpts.starters.real < medianScore ? 'L' : 'T';
                        if(!comboEntry.margins.median.marg) comboEntry.margins.median.marg = 0;
                        comboEntry.margins.median.marg += recordMan[i].fpts.starters.real - medianScore;

                        // add outcome-related stats to comboEntry & headToHeadRecords | update that week's entry in masterRecordBook
                        for(const recordType of recordTypes) {
                            if(recordType == 'upsets' && (!recordMan[i].outcomes[recordType] || recordMan[i].outcomes[recordType].includes('T'))) {
                                if(!recordMan[i].outcomes[recordType]) continue;
                                const halfOutcome = recordMan[i].outcomes[recordType].slice(1);
                                comboEntry.outcomes[recordType][halfOutcome] += 0.5;
                                headToHeadRecords[recordPeriod].years[year][recordManID][recordMan[i].oppRecordManID].outcomes[recordType][halfOutcome] += 0.5;
                                headToHeadRecords[recordPeriod].alltime[recordManID][recordMan[i].oppRecordManID].outcomes[recordType][halfOutcome] += 0.5;
                            } else {
                                if(Object.keys(compares).includes(recordType)) {
                                    recordMan[i].outcomes[recordType] = {};
                                    if(compares[recordType].L.length == 0) {
                                        recordMan[i].outcomes[recordType].top = true;
                                        comboEntry.outcomes[recordType].top++;
                                    } else if(compares[recordType].W.length == 0) {
                                        recordMan[i].outcomes[recordType].bottom = true;
                                        comboEntry.outcomes[recordType].bottom++;
                                    }
                                    for(const outcomeType in compares[recordType]) {
                                        recordMan[i].outcomes[recordType][outcomeType] = compares[recordType][outcomeType].length;
                                        comboEntry.outcomes[recordType][outcomeType] += compares[recordType][outcomeType].length;
                                        for(const opponent of compares[recordType][outcomeType]) {
                                            headToHeadRecords[recordPeriod].alltime[recordManID][opponent.recordManID].outcomes[recordType][outcomeType]++;
                                            headToHeadRecords[recordPeriod].years[year][recordManID][opponent.recordManID].outcomes[recordType][outcomeType]++;
                                        }
                                    }
                                } else {
                                    comboEntry.outcomes[recordType][recordMan[i].outcomes[recordType]]++;
                                    headToHeadRecords[recordPeriod].years[year][recordManID][recordMan[i].oppRecordManID].outcomes[recordType][recordMan[i].outcomes[recordType]]++;
                                    headToHeadRecords[recordPeriod].alltime[recordManID][recordMan[i].oppRecordManID].outcomes[recordType][recordMan[i].outcomes[recordType]]++;
                                }
                            }
                        }
                    }
                    // calculate cumulative-outcome stats
                    for(const recordType of recordTypes) {
                        comboEntry.outcomes[recordType].perc = (comboEntry.outcomes[recordType].W + comboEntry.outcomes[recordType].T / 2) / (comboEntry.outcomes[recordType].W + comboEntry.outcomes[recordType].T + comboEntry.outcomes[recordType].L) * 100;

                        for(const opponent in headToHeadRecords[recordPeriod].years[year][recordManID]) {
                            headToHeadRecords[recordPeriod].years[year][recordManID][opponent].outcomes[recordType].perc = (headToHeadRecords[recordPeriod].years[year][recordManID][opponent].outcomes[recordType].W + headToHeadRecords[recordPeriod].years[year][recordManID][opponent].outcomes[recordType].T / 2) / (headToHeadRecords[recordPeriod].years[year][recordManID][opponent].outcomes[recordType].W + headToHeadRecords[recordPeriod].years[year][recordManID][opponent].outcomes[recordType].T + headToHeadRecords[recordPeriod].years[year][recordManID][opponent].outcomes[recordType].L) * 100;
                        }
                    }
                    // calculate cumulative-points stats
                    for(const playerType of playerTypes) {
                        comboEntry.fpts[playerType].realPPG = comboEntry.fpts[playerType].real / recordMan.length;
                        comboEntry.fpts[playerType].projPPG = comboEntry.fpts[playerType].proj / recordMan.length;
                        comboEntry.fpts[playerType].diff = comboEntry.fpts[playerType].real - comboEntry.fpts[playerType].proj;
                        comboEntry.fpts[playerType].diffPG = comboEntry.fpts[playerType].diff / recordMan.length;
                        if(playerType == 'starters' || playerType == 'opp') comboEntry.fpts[playerType].possPPG = comboEntry.fpts[playerType].poss / recordMan.length;

                        for(const opponent in headToHeadRecords[recordPeriod].years[year][recordManID]) {
                            const numMatches = headToHeadRecords[recordPeriod].years[year][recordManID][opponent].outcomes.match.W + headToHeadRecords[recordPeriod].years[year][recordManID][opponent].outcomes.match.T + headToHeadRecords[recordPeriod].years[year][recordManID][opponent].outcomes.match.L;
                            headToHeadRecords[recordPeriod].years[year][recordManID][opponent].fpts[playerType].realPPG = headToHeadRecords[recordPeriod].years[year][recordManID][opponent].fpts[playerType].real / numMatches;
                            headToHeadRecords[recordPeriod].years[year][recordManID][opponent].fpts[playerType].projPPG = headToHeadRecords[recordPeriod].years[year][recordManID][opponent].fpts[playerType].proj / numMatches;
                            headToHeadRecords[recordPeriod].years[year][recordManID][opponent].fpts[playerType].diff = headToHeadRecords[recordPeriod].years[year][recordManID][opponent].fpts[playerType].real - headToHeadRecords[recordPeriod].years[year][recordManID][opponent].fpts[playerType].proj;
                            headToHeadRecords[recordPeriod].years[year][recordManID][opponent].fpts[playerType].diffPG = headToHeadRecords[recordPeriod].years[year][recordManID][opponent].fpts[playerType].diff / numMatches;
                            if(playerType == 'starters' || playerType == 'opp') headToHeadRecords[recordPeriod].years[year][recordManID][opponent].fpts[playerType].possPPG = headToHeadRecords[recordPeriod].years[year][recordManID][opponent].fpts[playerType].poss / numMatches;
                        }
                        for(const position of rosterPositions.years[year]) {
                            comboEntry.fpts.pos[position][playerType].realPPG = comboEntry.fpts.pos[position][playerType].real / comboEntry.fpts.pos[position][playerType].weeks;
                            comboEntry.fpts.pos[position][playerType].projPPG = comboEntry.fpts.pos[position][playerType].proj / comboEntry.fpts.pos[position][playerType].weeks;
                            comboEntry.fpts.pos[position][playerType].diff = comboEntry.fpts.pos[position][playerType].real - comboEntry.fpts.pos[position][playerType].proj;
                            comboEntry.fpts.pos[position][playerType].diffPG = comboEntry.fpts.pos[position][playerType].diff / comboEntry.fpts.pos[position][playerType].weeks;
                            if(playerType == 'starters' || playerType == 'opp') comboEntry.fpts.pos[position][playerType].perc = comboEntry.fpts.pos[position][playerType].real / comboEntry.fpts[playerType].real;
                            for(const transType of transTypes) {
                                comboEntry.fpts.transPos[transType][position][playerType].realPPG = comboEntry.fpts.transPos[transType][position][playerType].real / comboEntry.fpts.transPos[transType][position][playerType].weeks;
                                comboEntry.fpts.transPos[transType][position][playerType].projPPG = comboEntry.fpts.transPos[transType][position][playerType].proj / comboEntry.fpts.transPos[transType][position][playerType].weeks;
                                comboEntry.fpts.transPos[transType][position][playerType].diff = comboEntry.fpts.transPos[transType][position][playerType].real - comboEntry.fpts.transPos[transType][position][playerType].proj;
                                comboEntry.fpts.transPos[transType][position][playerType].diffPG = comboEntry.fpts.transPos[transType][position][playerType].diff / comboEntry.fpts.transPos[transType][position][playerType].weeks;
                                if(playerType == 'starters' || playerType == 'opp') {
                                    comboEntry.fpts.transPos[transType][position][playerType].percAll = comboEntry.fpts.transPos[transType][position][playerType].real / comboEntry.fpts[playerType].real;
                                    comboEntry.fpts.transPos[transType][position][playerType].percPos = comboEntry.fpts.transPos[transType][position][playerType].real / comboEntry.fpts.pos[position][playerType].real;
                                    comboEntry.fpts.transPos[transType][position][playerType].percTrans = comboEntry.fpts.transPos[transType][position][playerType].real / comboEntry.fpts.trans[transType][playerType].real;
                                }
                            }
                        }
                        for(const transType of transTypes) {
                            comboEntry.fpts.trans[transType][playerType].realPPG = comboEntry.fpts.trans[transType][playerType].real / comboEntry.fpts.trans[transType][playerType].weeks;
                            comboEntry.fpts.trans[transType][playerType].projPPG = comboEntry.fpts.trans[transType][playerType].proj / comboEntry.fpts.trans[transType][playerType].weeks;
                            comboEntry.fpts.trans[transType][playerType].diff = comboEntry.fpts.trans[transType][playerType].real - comboEntry.fpts.trans[transType][playerType].proj;
                            comboEntry.fpts.trans[transType][playerType].diffPG = comboEntry.fpts.trans[transType][playerType].diff / comboEntry.fpts.trans[transType][playerType].weeks;
                            if(playerType == 'starters' || playerType == 'opp') comboEntry.fpts.trans[transType][playerType].perc = comboEntry.fpts.trans[transType][playerType].real / comboEntry.fpts[playerType].real;
                        }
                    }
                    // add remaining cumulative stats to headToHeadRecords
                    for(const opponent in headToHeadRecords[recordPeriod].years[year][recordManID]) {
                        const numMatches = headToHeadRecords[recordPeriod].years[year][recordManID][opponent].wins + headToHeadRecords[recordPeriod].years[year][recordManID][opponent].ties + headToHeadRecords[recordPeriod].years[year][recordManID][opponent].losses;
                     
                        headToHeadRecords[recordPeriod].years[year][recordManID][opponent].margins.match = {
                            marg: headToHeadRecords[recordPeriod].years[year][recordManID][opponent].fpts.starters.real - headToHeadRecords[recordPeriod].years[year][recordManID][opponent].fpts.opp.real,
                            mpg: (headToHeadRecords[recordPeriod].years[year][recordManID][opponent].fpts.starters.real - headToHeadRecords[recordPeriod].years[year][recordManID][opponent].fpts.opp.real) / numMatches,
                        }
                        headToHeadRecords[recordPeriod].years[year][recordManID][opponent].margins.proj = {
                            marg: headToHeadRecords[recordPeriod].years[year][recordManID][opponent].fpts.starters.proj - headToHeadRecords[recordPeriod].years[year][recordManID][opponent].fpts.opp.proj,
                            mpg: (headToHeadRecords[recordPeriod].years[year][recordManID][opponent].fpts.starters.proj - headToHeadRecords[recordPeriod].years[year][recordManID][opponent].fpts.opp.proj) / numMatches,
                        }
                        headToHeadRecords[recordPeriod].years[year][recordManID][opponent].iq = headToHeadRecords[recordPeriod].years[year][recordManID][opponent].fpts.starters.real / headToHeadRecords[recordPeriod].years[year][recordManID][opponent].fpts.starters.poss * 100;
                        // index notable matches
                        headToHeadRecords[recordPeriod].years[year][recordManID][opponent].highScore = headToHeadRecords[recordPeriod].years[year][recordManID][opponent].matchups.indexOf(headToHeadRecords[recordPeriod].years[year][recordManID][opponent].matchups.slice().sort((a, b) => b.fpts.starters.real - a.fpts.starters.real)[0]);
                        headToHeadRecords[recordPeriod].years[year][recordManID][opponent].lowScore = headToHeadRecords[recordPeriod].years[year][recordManID][opponent].matchups.indexOf(headToHeadRecords[recordPeriod].years[year][recordManID][opponent].matchups.slice().sort((a, b) => a.fpts.starters.real - b.fpts.starters.real)[0]);
                        headToHeadRecords[recordPeriod].years[year][recordManID][opponent].bestBlowout = headToHeadRecords[recordPeriod].years[year][recordManID][opponent].matchups.indexOf(headToHeadRecords[recordPeriod].years[year][recordManID][opponent].matchups.slice().sort((a, b) => b.matchDifferential - a.matchDifferential)[0]);
                        headToHeadRecords[recordPeriod].years[year][recordManID][opponent].worstBlowout = headToHeadRecords[recordPeriod].years[year][recordManID][opponent].matchups.indexOf(headToHeadRecords[recordPeriod].years[year][recordManID][opponent].matchups.slice().sort((a, b) => a.matchDifferential - b.matchDifferential)[0]);
                        headToHeadRecords[recordPeriod].years[year][recordManID][opponent].bestNailbiter = headToHeadRecords[recordPeriod].years[year][recordManID][opponent].matchups.indexOf(headToHeadRecords[recordPeriod].years[year][recordManID][opponent].matchups.filter(m => m.matchDifferential >= 0).sort((a, b) => a.matchDifferential - b.matchDifferential)[0]);
                        headToHeadRecords[recordPeriod].years[year][recordManID][opponent].worstNailbiter = headToHeadRecords[recordPeriod].years[year][recordManID][opponent].matchups.indexOf(headToHeadRecords[recordPeriod].years[year][recordManID][opponent].matchups.filter(m => m.matchDifferential <= 0).sort((a, b) => b.matchDifferential - a.matchDifferential)[0]);
                        headToHeadRecords[recordPeriod].years[year][recordManID][opponent].upsetWin = headToHeadRecords[recordPeriod].years[year][recordManID][opponent].matchups.indexOf(headToHeadRecords[recordPeriod].years[year][recordManID][opponent].matchups.filter(m => m.outcomes.upsets == 'W')?.sort((a, b) => b.matchDifferential - a.matchDifferential)[0]);
                        headToHeadRecords[recordPeriod].years[year][recordManID][opponent].upsetLoss = headToHeadRecords[recordPeriod].years[year][recordManID][opponent].matchups.indexOf(headToHeadRecords[recordPeriod].years[year][recordManID][opponent].matchups.filter(m => m.outcomes.upsets == 'L')?.sort((a, b) => a.matchDifferential - b.matchDifferential)[0]);
                    }
                    // add remaining cumulative stats to comboEntry
                    comboEntry.margins.match = {
                        marg: comboEntry.fpts.starters.real - comboEntry.fpts.opp.real,
                        mpg: (comboEntry.fpts.starters.real - comboEntry.fpts.opp.real) / recordMan.length,
                    }
                    comboEntry.margins.proj = {
                        marg: comboEntry.fpts.starters.proj - comboEntry.fpts.opp.proj,
                        mpg: (comboEntry.fpts.starters.proj - comboEntry.fpts.opp.proj) / recordMan.length,
                    }
                    comboEntry.margins.median.mpg = comboEntry.margins.median.marg / recordMan.length;
                    comboEntry.optimalProjPG = comboEntry.optimalProj / recordMan.length;
                    comboEntry.beatProjPerc = comboEntry.beatProj / recordMan.length * 100;
                    comboEntry.beatOptProjPerc = comboEntry.beatOptProj / recordMan.length * 100;
                    comboEntry.iq = comboEntry.fpts.starters.real / comboEntry.fpts.starters.poss * 100;
                    // push comboEntry to masterRecordBook
                    masterRecordBook.seasons.managers[recordPeriod].push(comboEntry);

                    // PLAYERS SEASON STATS
                    const playerTotals = {};
                    let uniqueStarters = 0;

                    for(const key in recordPlayer) {
                        const player = recordPlayer[key];

                        if(!playerTotals[player.playerID]) {
                            playerTotals[player.playerID] = {
                                recordManID,
                                manager: player.manager,
                                year,
                                rosterID: player.rosterID,
                                playerID: player.playerID,
                                expectations: {
                                    exceedProj: {},
                                    metProj: {},
                                    belowProj: {},
                                },
                                fpts: {
                                    teams: {},
                                    trans: {},
                                },
                                weeks: {
                                    weeks: [],
                                },
                                topStarters: 0,
                                bottomStarters: 0,
                                starterRanks: 0,
                                playerInfo: player.playerInfo,
                                nflInfo: player.nflInfo,
                                avatar: player.avatar,
                                rosterSpot: player.rosterSpot,
                                nullifyProj: player.nullifyProj,
                                drafted: false,
                                price: {},
                                team: player.team,
                            }
                            
                            for(const playerType of playerTypes) {
                                if(playerType == 'opp') continue;
                                for(const expectation in playerTotals[player.playerID].expectations) {
                                    playerTotals[player.playerID].expectations[expectation][playerType] = {
                                        diff: 0,
                                        weeks: 0,
                                    }
                                }
                                playerTotals[player.playerID].fpts[playerType] = {
                                    proj: 0,
                                    real: 0,
                                }
                                playerTotals[player.playerID].weeks[playerType] = 0;
                            }

                            if(player.benched == false) uniqueStarters++;
                        }
                        if(!playerTotals[player.playerID].weeks.weeks.includes(week)) playerTotals[player.playerID].weeks.weeks.push(player.week);

                        if(player.howAcquired == 'draft' && playerTotals[player.playerID].drafted == false) playerTotals[player.playerID].drafted = true;
                        if((player.price || player?.price == 0) && !playerTotals[player.playerID].price[player.howAcquired]) playerTotals[player.playerID].price[player.howAcquired] = player.price;
                        if(playerTotals[player.playerID].rosterSpot == null || playerTotals[player.playerID].rosterSpot.includes('FLEX')) playerTotals[player.playerID].rosterSpot = player.rosterSpot;
                        if(playerTotals[player.playerID].team == null) playerTotals[player.playerID].team = player.team;
                        if(player.nullifyProj == true && playerTotals[player.playerID].nullifyProj == false) playerTotals[player.playerID].nullifyProj == true;

                        if(!playerTotals[player.playerID].fpts.trans[player.howAcquired]) {
                            playerTotals[player.playerID].fpts.trans[player.howAcquired] = {};
                            for(const playerType of playerTypes) {
                                playerTotals[player.playerID].fpts.trans[player.howAcquired][playerType] = {
                                    real: 0,
                                    proj: 0,
                                    weeks: 0,
                                }
                            }
                        }
                        if(!playerTotals[player.playerID].fpts.teams[player.team]) {
                            playerTotals[player.playerID].fpts.teams[player.team] = {};
                            for(const playerType of playerTypes) {
                                playerTotals[player.playerID].fpts.teams[player.team][playerType] = {
                                    real: 0,
                                    proj: 0,
                                    weeks: 0,
                                }
                            }
                        }
                        let totalRecorded = false;
                        for(const playerType of playerTypes) {
                            if(playerType == 'total' || playerType == 'opp') continue;

                            if((playerType == 'starters' && player.benched == false) || (playerType == 'bench' && player.benched == true)) {
                                playerTotals[player.playerID].fpts[playerType].real += player.fpts;
                                playerTotals[player.playerID].fpts[playerType].proj += player.nullifyProj == false ? player.projFpts : player.fpts;
                                playerTotals[player.playerID].weeks[playerType]++;
                                playerTotals[player.playerID].fpts.trans[player.howAcquired][playerType].real += player.fpts;
                                playerTotals[player.playerID].fpts.trans[player.howAcquired][playerType].proj += player.nullifyProj == false ? player.projFpts : player.fpts;
                                playerTotals[player.playerID].fpts.trans[player.howAcquired][playerType].weeks++;
                                playerTotals[player.playerID].fpts.teams[player.team][playerType].real += player.fpts;
                                playerTotals[player.playerID].fpts.teams[player.team][playerType].proj += player.nullifyProj == false ? player.projFpts : player.fpts;
                                playerTotals[player.playerID].fpts.teams[player.team][playerType].weeks++;

                                if(playerType == 'starters') {
                                    playerTotals[player.playerID].starterRanks += player.starterRank;
                                    if(player.topStarter == true) {
                                        playerTotals[player.playerID].topStarters++;
                                    } else if(player.bottomStarter == true) {
                                        playerTotals[player.playerID].bottomStarters++;
                                    }
                                } 

                                if(player.projResult == true) {
                                    playerTotals[player.playerID].expectations.exceedProj[playerType].weeks++;
                                    playerTotals[player.playerID].expectations.exceedProj[playerType].diff += player.projDiff;
                                    if(!totalRecorded) {
                                        playerTotals[player.playerID].expectations.exceedProj.total.weeks++;
                                        playerTotals[player.playerID].expectations.exceedProj.total.diff += player.projDiff;
                                    }
                                } else if(player.projResult == false) {
                                    playerTotals[player.playerID].expectations.belowProj[playerType].weeks++;
                                    playerTotals[player.playerID].expectations.belowProj[playerType].diff += player.projDiff;
                                    if(!totalRecorded) {
                                        playerTotals[player.playerID].expectations.belowProj.total.weeks++;
                                        playerTotals[player.playerID].expectations.belowProj.total.diff += player.projDiff;
                                    }
                                } else if(player.projResult == 'equal') {
                                    playerTotals[player.playerID].expectations.metProj[playerType].weeks++;
                                    if(!totalRecorded) playerTotals[player.playerID].expectations.metProj.total.weeks++;
                                }
                                if(totalRecorded) continue;
                                playerTotals[player.playerID].fpts.total.real += player.fpts;
                                playerTotals[player.playerID].fpts.total.proj += player.nullifyProj == false ? player.projFpts : player.fpts;
                                playerTotals[player.playerID].weeks.total++;
                                playerTotals[player.playerID].fpts.trans[player.howAcquired].total.real += player.fpts;
                                playerTotals[player.playerID].fpts.trans[player.howAcquired].total.proj += player.nullifyProj == false ? player.projFpts : player.fpts;
                                playerTotals[player.playerID].fpts.trans[player.howAcquired].total.weeks++;
                                playerTotals[player.playerID].fpts.teams[player.team].total.real += player.fpts;
                                playerTotals[player.playerID].fpts.teams[player.team].total.proj += player.nullifyProj == false ? player.projFpts : player.fpts;
                                playerTotals[player.playerID].fpts.teams[player.team].total.weeks++;
                                totalRecorded = true;
                            }
                        }
                    }

                    for(const playerID in playerTotals) {

                        playerTotals[playerID].numStarters = uniqueStarters;
                        playerTotals[playerID].starterRankAVG = playerTotals[playerID].weeks.starters > 0 ? playerTotals[playerID].starterRanks / playerTotals[playerID].weeks.starters : null;

                        for(const playerType of playerTypes) {
                            if(playerType == 'opp') continue;
                            for(const team in playerTotals[playerID].fpts.teams) {
                                playerTotals[playerID].fpts.teams[team][playerType].realPPG = playerTotals[playerID].fpts.teams[team][playerType].real / playerTotals[playerID].fpts.teams[team][playerType].weeks;
                                playerTotals[playerID].fpts.teams[team][playerType].projPPG = playerTotals[playerID].fpts.teams[team][playerType].proj / playerTotals[playerID].fpts.teams[team][playerType].weeks;
                                playerTotals[playerID].fpts.teams[team][playerType].diff = playerTotals[playerID].fpts.teams[team][playerType].real - playerTotals[playerID].fpts.teams[team][playerType].proj;
                                playerTotals[playerID].fpts.teams[team][playerType].diffPG = playerTotals[playerID].fpts.teams[team][playerType].diff / playerTotals[playerID].fpts.teams[team][playerType].weeks;
                            }
                            for(const transType in playerTotals[playerID].fpts.trans) {
                                playerTotals[playerID].fpts.trans[transType][playerType].realPPG = playerTotals[playerID].fpts.trans[transType][playerType].real / playerTotals[playerID].fpts.trans[transType][playerType].weeks;
                                playerTotals[playerID].fpts.trans[transType][playerType].projPPG = playerTotals[playerID].fpts.trans[transType][playerType].proj / playerTotals[playerID].fpts.trans[transType][playerType].weeks;
                                playerTotals[playerID].fpts.trans[transType][playerType].diff = playerTotals[playerID].fpts.trans[transType][playerType].real - playerTotals[playerID].fpts.trans[transType][playerType].proj;
                                playerTotals[playerID].fpts.trans[transType][playerType].diffPG = playerTotals[playerID].fpts.trans[transType][playerType].diff / playerTotals[playerID].fpts.trans[transType][playerType].weeks;
                                if(playerType == 'starters' && (playerTotals[playerID].price[transType] || playerTotals[playerID].price[transType] == 0)) playerTotals[playerID].fpts.trans[transType][playerType].roi = playerTotals[playerID].price[transType] == 0 ? playerTotals[playerID].fpts.trans[transType][playerType].realPPG : playerTotals[playerID].fpts.trans[transType][playerType].realPPG / playerTotals[playerID].price[transType];
                            } 
                            for(const expectation in playerTotals[playerID].expectations) {
                                playerTotals[playerID].expectations[expectation][playerType].diffPG = playerTotals[playerID].expectations[expectation][playerType].diff / playerTotals[playerID].expectations[expectation][playerType].weeks;
                            }
                            playerTotals[playerID].fpts[playerType].realPPG = playerTotals[playerID].fpts[playerType].real / playerTotals[playerID].weeks[playerType];
                            playerTotals[playerID].fpts[playerType].projPPG = playerTotals[playerID].fpts[playerType].proj / playerTotals[playerID].weeks[playerType];
                            playerTotals[playerID].fpts[playerType].diff = playerTotals[playerID].fpts[playerType].real - playerTotals[playerID].fpts[playerType].proj;
                            playerTotals[playerID].fpts[playerType].diffPG = playerTotals[playerID].fpts[playerType].diff / playerTotals[playerID].weeks[playerType]; 
                        }      
                        masterRecordBook.seasons.players[recordPeriod].push(playerTotals[playerID]);
                        const pos = playersInfo[playerID].pos == 'FB' ? 'RB' : playersInfo[playerID].pos;
                        if(!fantasyPositionRanks[year][pos].find(p => p.playerID == playerID)) {
                            const entry = {
                                playerID,
                                pos,
                                fpts: playerTotals[playerID].fpts.total.real,
                                weeks: playerTotals[playerID].weeks.total,
                                info: playersInfo[playerID],
                            }
                            fantasyPositionRanks[year][pos].push(entry);
                            fantasyPositionRanks[year].OVR.push(entry);
                        } else {
                            const seasonPlayer = fantasyPositionRanks[year][pos].find(p => p.playerID == playerID);
                            const overallPlayer = fantasyPositionRanks[year].OVR.find(p => p.playerID == playerID);
                            seasonPlayer.fpts += playerTotals[playerID].fpts.total.real;
                            overallPlayer.fpts += playerTotals[playerID].fpts.total.real;
                            seasonPlayer.weeks += playerTotals[playerID].weeks.total;
                            overallPlayer.weeks += playerTotals[playerID].weeks.total;
                        }
                    }
                }
            }
        }

        // calculate PPG of individual players for ranking purposes
        for(const player of fantasyPositionRanks[year].OVR) {
            player.fptspg = player.fpts / player.weeks;
            fantasyPositionRanks[year][player.pos].find(p => p.playerID == player.playerID).fptspg = player.fptspg;
        }
        for(const position in fantasyPositionRanks[year]) {
            fantasyPositionRanks[year][position].sort((a, b) => b.fptspg - a.fptspg);
        }

        recordArrays.league.years[year] = {};
        recordArrays.managers.years[year] = {};

        for(const recordPeriod of recordPeriods) {

            if(recordPeriod == 'playoffs' && !masterRecordBook.weeks.managers.find(w => w.week >= playoffStart)) continue;

            recordArrays.managers.years[year][recordPeriod] = {};
            let seasonMan = masterRecordBook.seasons.managers[recordPeriod].filter(w => w.year == year);
            let seasonPlayer = masterRecordBook.seasons.players[recordPeriod].filter(w => w.year == year);
            let weekPlayer = masterRecordBook.weeks.players.filter(w => w.year == year);
            let weekMan = masterRecordBook.weeks.managers.filter(w => w.year == year);
            if(recordPeriod == 'regular') {
                weekPlayer = weekPlayer.filter(w => w.period == 'regular');
                weekMan = weekMan.filter(w => w.period == 'regular');
            } else if(recordPeriod == 'playoffs') {
                weekPlayer = weekPlayer.filter(w => w.period == 'playoffs');
                weekMan = weekMan.filter(w => w.period == 'playoffs');
            } 

            recordArrays.league.years[year][recordPeriod] = {
                weekHighs: weekMan.slice().sort((a, b) => b.fpts.starters.real - a.fpts.starters.real).slice(0, 10),
                weekLows: weekMan.slice().sort((a, b) => a.fpts.starters.real - b.fpts.starters.real).slice(0, 10),
                periodHighs: seasonMan.slice().sort((a, b) => b.fpts.starters.realPPG - a.fpts.starters.realPPG).slice(0, 10),
                periodLows: seasonMan.slice().sort((a, b) => a.fpts.starters.realPPG - b.fpts.starters.realPPG).slice(0, 10),
                biggestBlowouts: weekMan.filter(v => v.matchDifferential >= 0).sort((a, b) => b.matchDifferential - a.matchDifferential).slice(0, 10),
                narrowestVictories: weekMan.filter(v => v.matchDifferential >= 0).sort((a, b) => a.matchDifferential - b.matchDifferential).slice(0, 10),
                managerBests: {
                    epeRecords: seasonMan.slice().sort((a, b) => b.outcomes.EPE.perc - a.outcomes.EPE.perc),
                    bestBalls: seasonMan.slice().sort((a, b) => b.outcomes.bball.perc - a.outcomes.bball.perc),
                    medianRecords: seasonMan.slice().sort((a, b) => b.outcomes.median.perc - a.outcomes.median.perc),
                    fptsHistories: seasonMan.slice().sort((a, b) => b.fpts.starters.real - a.fpts.starters.real),
                    winRecords: seasonMan.slice().sort((a, b) => b.outcomes.match.perc - a.outcomes.match.perc),
                    lineupIqs: seasonMan.slice().sort((a, b) => b.iq - a.iq),
                    fptsPoss: seasonMan.slice().sort((a, b) => b.fpts.starters.poss - a.fpts.starters.poss),
                    projRecords: seasonMan.slice().sort((a, b) => b.fpts.starters.proj - a.fpts.starters.proj),
                    blowoutBests: [],
                    blowoutWorsts: [],
                    narrowBests: [],
                    narrowWorsts: [],
                },
                transactions: {
                    moves: [],
                    trade: [],
                    waiver: [],
                    freeAgent: [],
                    wires: [],
                },
                positions: {
                    leagueAverages: {},
                },
                acquisitions: {
                    leagueAverages: {},
                },
                players: {
                    weekHighs: weekPlayer.filter(p => p.benched == false).sort((a, b) => b.fpts - a.fpts).slice(0, 10),
                    weekMissedHighs: weekPlayer.filter(p => p.benched == true).sort((a, b) => b.fpts - a.fpts).slice(0, 10),
                    periodHighs: seasonPlayer.filter(p => p.weeks.starters > 0).sort((a, b) => b.fpts.starters.real - a.fpts.starters.real).slice(0, 10),	
                    gamesHighs: seasonPlayer.filter(p => p.weeks.starters > 0).sort((a, b) => b.weeks.starters - a.weeks.starters).slice(0, 10),	
                    overallMissedHighs: seasonPlayer.filter(p => p.weeks.bench > 0).sort((a, b) => b.fpts.bench.real - a.fpts.bench.real).slice(0, 10),
                    overallHighs: seasonPlayer.slice().sort((a, b) => b.fpts.total.real - a.fpts.total.real).slice(0, 10),
                    weekOvers: weekPlayer.filter(p => p.benched == false && p.projResult == true && p.nullifyProj == false).sort((a, b) => b.projDiff - a.projDiff).slice(0, 10),
                    weekUnders: weekPlayer.filter(p => p.benched == false && p.projResult == false && p.nullifyProj == false).sort((a, b) => a.projDiff - b.projDiff).slice(0, 10),
                    seasonOvers: seasonPlayer.filter(p => p.weeks.starters > 0 && p.fpts.starters.diff > 0 && p.nullifyProj == false).sort((a, b) => b.fpts.starters.diff - a.fpts.starters.diff).slice(0, 10),
                    seasonUnders: seasonPlayer.filter(p => p.weeks.starters > 0 && p.fpts.starters.diff < 0 && p.nullifyProj == false).sort((a, b) => a.fpts.starters.diff - b.fpts.starters.diff).slice(0, 10),
                    managerBests: {},
                },
            };
            for(const key in recordArrays.league.years[year][recordPeriod]) {
                if(key != 'transactions' && key != 'managerBests' && key != 'biggestBlowouts' && key != 'narrowestVictories' && key != 'players' && key != 'positions' && key != 'acquisitions') recordArrays.league.years[year][recordPeriod].managerBests[key] = [];
            }
            for(const key in recordArrays.league.years[year][recordPeriod].players) {
                if(key != 'managerBests') recordArrays.league.years[year][recordPeriod].players.managerBests[key] = [];
            }

            for(const recordManID in originalManagers) {
                let recordID = weekMan.filter(w => w.recordManID == recordManID);
                let playerMan = weekPlayer.filter(w => w.recordManID == recordManID);
                let seasonManID = seasonMan.find(s => s.recordManID == recordManID);
                let seasonPlayerID = seasonPlayer.filter(p => p.recordManID == recordManID);

                if(transactionsInfo.years[year].totals[recordManID]) {
                    for(const key in recordArrays.league.years[year][recordPeriod].transactions) {
                        if(key == 'moves') continue;
                        const entry = {
                            recordManID,
                            manager: originalManagers[recordManID],
                        }
                        if(key == 'wires') {
                            if(recordPeriod == 'combined') {
                                entry[key] = transactionsInfo.years[year].totals[recordManID].regular.waiver + transactionsInfo.years[year].totals[recordManID].regular.freeAgent + transactionsInfo.years[year].totals[recordManID].playoffs.waiver + transactionsInfo.years[year].totals[recordManID].playoffs.freeAgent;
                            } else if(recordPeriod == 'regular') {
                                entry[key] = transactionsInfo.years[year].totals[recordManID].regular.waiver + transactionsInfo.years[year].totals[recordManID].regular.freeAgent
                            } else {
                                entry[key] = transactionsInfo.years[year].totals[recordManID].playoffs.waiver + transactionsInfo.years[year].totals[recordManID].playoffs.freeAgent;
                            }
                        } else {
                            entry[key] = recordPeriod == 'combined' ? transactionsInfo.years[year].totals[recordManID].regular[key] + transactionsInfo.years[year].totals[recordManID].playoffs[key] : transactionsInfo.years[year].totals[recordManID][recordPeriod][key];
                        }
                        if(key == 'waiver') {
                            entry.outbid = recordPeriod == 'combined' ? transactionsInfo.years[year].totals[recordManID].regular.outbid + transactionsInfo.years[year].totals[recordManID].playoffs.outbid : transactionsInfo.years[year].totals[recordManID][recordPeriod].outbid;
                            entry.waiverPerc = entry.waiver + entry.outbid > 0 ? entry.waiver / (entry.waiver + entry.outbid) * 100 : 'N/A';
                        }
                    }
                }

                if(recordID.length > 0) {

                    recordArrays.managers.years[year][recordPeriod][recordManID] = {
                        weekHighs: recordID.slice().sort((a, b) => b.fpts.starters.real - a.fpts.starters.real).slice(0, 10),
                        weekLows: recordID.slice().sort((a, b) => a.fpts.starters.real - b.fpts.starters.real).slice(0, 10),
                        blowoutBests: recordID.filter(v => v.matchDifferential >= 0).sort((a, b) => b.matchDifferential - a.matchDifferential).slice(0, 10),
                        blowoutWorsts: recordID.filter(v => v.matchDifferential <= 0).sort((a, b) => a.matchDifferential - b.matchDifferential).slice(0, 10),
                        narrowBests: recordID.filter(v => v.matchDifferential >= 0).sort((a, b) => a.matchDifferential - b.matchDifferential).slice(0, 10),
                        narrowWorsts: recordID.filter(v => v.matchDifferential <= 0).sort((a, b) => b.matchDifferential - a.matchDifferential).slice(0, 10),
                        headToHeads: [],
                        players: {
                            weekHighs: playerMan.filter(p => p.benched == false).sort((a, b) => b.fpts - a.fpts).slice(0, 10),
                            weekMissedHighs: playerMan.filter(p => p.benched == true).sort((a, b) => b.fpts - a.fpts).slice(0, 10),
                            periodHighs: seasonPlayerID.filter(p => p.weeks.starters > 0).sort((a, b) => b.fpts.starters.real - a.fpts.starters.real).slice(0, 10),
                            gamesHighs: seasonPlayerID.filter(p => p.weeks.starters > 0).sort((a, b) => b.weeks.starters - a.weeks.starters).slice(0, 10),
                            overallHighs: seasonPlayerID.filter(p => p.weeks.starters > 0 && p.weeks.bench > 0).sort((a, b) => b.fpts.total.real - a.fpts.total.real).slice(0, 10),
                            overallMissedHighs: seasonPlayerID.filter(p => p.weeks.bench > 0).sort((a, b) => b.fpts.bench.real - a.fpts.bench.real).slice(0, 10),
                            weekOvers: playerMan.filter(p => p.benched == false && p.projResult == true && p.nullifyProj == false).sort((a, b) => b.projDiff - a.projDiff).slice(0, 10),
                            weekUnders: playerMan.filter(p => p.benched == false && p.projResult == false && p.nullifyProj == false).sort((a, b) => a.projDiff - b.projDiff).slice(0, 10),
                            seasonOvers: seasonPlayerID.filter(p => p.weeks.starters > 0 && p.fpts.starters.diff > 0 && p.nullifyProj == false).sort((a, b) => b.fpts.starters.diff - a.fpts.starters.diff).slice(0, 10),
                            seasonUnders: seasonPlayerID.filter(p => p.weeks.starters > 0 && p.fpts.starters.diff < 0 && p.nullifyProj == false).sort((a, b) => a.fpts.starters.diff - b.fpts.starters.diff).slice(0, 10),
                        },
                        positions: {},
                        acquisitions: {},
                    };

                    for(const opponent in headToHeadRecords[recordPeriod].years[year][recordManID]) {
                        recordArrays.managers.years[year][recordPeriod][recordManID].headToHeads.push(headToHeadRecords[recordPeriod].years[year][recordManID][opponent]);
                    }
                    recordArrays.managers.years[year][recordPeriod][recordManID].headToHeads.sort((a, b) => b.outcomes.match.perc - a.outcomes.match.perc);

                    for(const key in recordArrays.managers.years[year][recordPeriod][recordManID].players) {
                        if(recordArrays.managers.years[year][recordPeriod][recordManID].players[key].length > 0) recordArrays.league.years[year][recordPeriod].players.managerBests[key].push(recordArrays.managers.years[year][recordPeriod][recordManID].players[key][0]);
                    }
                    for(const key in recordArrays.managers.years[year][recordPeriod][recordManID]) {
                        if(recordArrays.managers.years[year][recordPeriod][recordManID][key].length > 0 && key != 'headToHeads' && key != 'players' && key != 'positions' && key != 'acquisitions') recordArrays.league.years[year][recordPeriod].managerBests[key].push(recordArrays.managers.years[year][recordPeriod][recordManID][key][0]);
                    }
                }

                for(const position of rosterPositions.years[year]) {
                    if(!recordArrays.league.years[year][recordPeriod].positions.leagueAverages[position]) {
                        recordArrays.league.years[year][recordPeriod].positions.leagueAverages[position] = {
                            real: 0,
                            proj: 0,
                            weeks: 0,
                            managerAverages: [],
                        }
                        recordArrays.league.years[year][recordPeriod].positions[position] = {
                            weekHighs: weekPlayer.filter(p => p.playerInfo.pos == position && p.benched == false).sort((a, b) => b.fpts - a.fpts).slice(0, 10),
                            weekMissedHighs: weekPlayer.filter(p => p.playerInfo.pos == position && p.benched == true).sort((a, b) => b.fpts - a.fpts).slice(0, 10),
                            periodHighs: seasonPlayer.filter(p => p.playerInfo.pos == position && p.weeks.starters > 0).sort((a, b) => b.fpts.starters.real - a.fpts.starters.real).slice(0, 10),
                            gamesHighs: seasonPlayer.filter(p => p.playerInfo.pos == position && p.weeks.starters > 0).sort((a, b) => b.weeks.starters - a.weeks.starters).slice(0, 10),
                            overallHighs: seasonPlayer.filter(p => p.playerInfo.pos == position).sort((a, b) => b.fpts.total.real - a.fpts.total.real).slice(0, 10),
                            overallMissedHighs: seasonPlayer.filter(p => p.playerInfo.pos == position && p.weeks.bench > 0).sort((a, b) => b.fpts.bench.real - a.fpts.bench.real).slice(0, 10),
                            weekOvers: weekPlayer.filter(p => p.playerInfo.pos == position && p.benched == false && p.projResult == true && p.nullifyProj == false).sort((a, b) => b.projDiff - a.projDiff).slice(0, 10),
                            weekUnders: weekPlayer.filter(p => p.playerInfo.pos == position && p.benched == false && p.projResult == false && p.nullifyProj == false).sort((a, b) => a.projDiff - b.projDiff).slice(0, 10),
                            seasonOvers: seasonPlayer.filter(p => p.playerInfo.pos == position && p.weeks.starters > 0 && p.fpts.starters.diff > 0 && p.nullifyProj == false).sort((a, b) => b.fpts.starters.diff - a.fpts.starters.diff).slice(0, 10),
                            seasonUnders: seasonPlayer.filter(p => p.playerInfo.pos == position && p.weeks.starters > 0 && p.fpts.starters.diff < 0 && p.nullifyProj == false).sort((a, b) => a.fpts.starters.diff - b.fpts.starters.diff).slice(0, 10),
                            managerBests: {},
                        }
                        for(const key in recordArrays.league.years[year][recordPeriod].positions[position]) {
                            if(key != 'managerBests') recordArrays.league.years[year][recordPeriod].positions[position].managerBests[key] = [];
                        }
                    }
                    if(playerMan.length > 0) {

                        recordArrays.managers.years[year][recordPeriod][recordManID].positions[position] = {
                            weekHighs: playerMan.filter(p => p.playerInfo.pos == position && p.benched == false).sort((a, b) => b.fpts - a.fpts).slice(0, 10),
                            weekMissedHighs: playerMan.filter(p => p.playerInfo.pos == position && p.benched == true).sort((a, b) => b.fpts - a.fpts).slice(0, 10),
                            periodHighs: seasonPlayerID.filter(p => p.playerInfo.pos == position && p.weeks.starters > 0).sort((a, b) => b.fpts.starters.real - a.fpts.starters.real).slice(0, 10),
                            gamesHighs: seasonPlayerID.filter(p => p.playerInfo.pos == position && p.weeks.starters > 0).sort((a, b) => b.weeks.starters - a.weeks.starters).slice(0, 10),
                            overallHighs: seasonPlayerID.filter(p => p.playerInfo.pos == position).sort((a, b) => b.fpts.total.real - a.fpts.total.real).slice(0, 10),
                            overallMissedHighs: seasonPlayerID.filter(p => p.playerInfo.pos == position && p.weeks.bench > 0).sort((a, b) => b.fpts.bench.real - a.fpts.bench.real).slice(0, 10),
                            weekOvers: playerMan.filter(p => p.playerInfo.pos == position && p.benched == false && p.projResult == true && p.nullifyProj == false).sort((a, b) => b.projDiff - a.projDiff).slice(0, 10),
                            weekUnders: playerMan.filter(p => p.playerInfo.pos == position && p.benched == false && p.projResult == false && p.nullifyProj == false).sort((a, b) => a.projDiff - b.projDiff).slice(0, 10),
                            seasonOvers: seasonPlayerID.filter(p => p.playerInfo.pos == position && p.weeks.starters > 0 && p.fpts.starters.diff > 0 && p.nullifyProj == false).sort((a, b) => b.fpts.starters.diff - a.fpts.starters.diff).slice(0, 10),
                            seasonUnders: seasonPlayerID.filter(p => p.playerInfo.pos == position && p.weeks.starters > 0 && p.fpts.starters.diff < 0 && p.nullifyProj == false).sort((a, b) => a.fpts.starters.diff - b.fpts.starters.diff).slice(0, 10),
                        }
                        for(const key in recordArrays.managers.years[year][recordPeriod][recordManID].positions[position]) {
                            if(recordArrays.managers.years[year][recordPeriod][recordManID].positions[position][key].length > 0) recordArrays.league.years[year][recordPeriod].positions[position].managerBests[key].push(recordArrays.managers.years[year][recordPeriod][recordManID].positions[position][key][0]);
                        }

                        recordArrays.league.years[year][recordPeriod].positions.leagueAverages[position].managerAverages.push({
                            recordManID,
                            manager: originalManagers[recordManID],
                            real: seasonManID.fpts.pos[position].starters.real,
                            realPPG: seasonManID.fpts.pos[position].starters.realPPG,
                            proj: seasonManID.fpts.pos[position].starters.proj,
                            projPPG: seasonManID.fpts.pos[position].starters.projPPG,
                            perc: seasonManID.fpts.pos[position].starters.perc,
                        })
                        for(const key in recordArrays.league.years[year][recordPeriod].positions.leagueAverages[position]) {
                            if(key != 'managerAverages') recordArrays.league.years[year][recordPeriod].positions.leagueAverages[position][key] += seasonManID.fpts.pos[position].starters[key];
                        }
                    }
                }

                for(const transType of transTypes) {
                    if(!recordArrays.league.years[year][recordPeriod].acquisitions[transType]) {
                        recordArrays.league.years[year][recordPeriod].acquisitions.leagueAverages[transType] = {
                            real: 0,
                            proj: 0,
                            weeks: 0,
                            managerAverages: [],
                        }
                        recordArrays.league.years[year][recordPeriod].acquisitions[transType] = {
                            weekHighs: weekPlayer.filter(p => p.howAcquired == transType && p.benched == false).sort((a, b) => b.fpts - a.fpts).slice(0, 10),
                            weekMissedHighs: weekPlayer.filter(p => p.howAcquired == transType && p.benched == true).sort((a, b) => b.fpts - a.fpts).slice(0, 10),
                            periodHighs: seasonPlayer.filter(p => p.fpts.trans[transType] && p.fpts.trans[transType].starters.weeks > 0).sort((a, b) => b.fpts.trans[transType].starters.real - a.fpts.trans[transType].starters.real).slice(0, 10),
                            gamesHighs: seasonPlayer.filter(p => p.fpts.trans[transType] && p.fpts.trans[transType].starters.weeks > 0).sort((a, b) => b.fpts.trans[transType].starters.weeks - a.fpts.trans[transType].starters.weeks).slice(0, 10),
                            overallHighs: seasonPlayer.filter(p => p.fpts.trans[transType]).sort((a, b) => b.fpts.trans[transType].total.real - a.fpts.trans[transType].total.real).slice(0, 10),
                            overallMissedHighs: seasonPlayer.filter(p => p.fpts.trans[transType] && p.fpts.trans[transType].bench.weeks > 0).sort((a, b) => b.fpts.trans[transType].bench.real - a.fpts.trans[transType].bench.real).slice(0, 10),
                            weekOvers: weekPlayer.filter(p => p.howAcquired == transType && p.benched == false && p.projResult == true && p.nullifyProj == false).sort((a, b) => b.projDiff - a.projDiff).slice(0, 10),
                            weekUnders: weekPlayer.filter(p => p.howAcquired == transType && p.benched == false && p.projResult == false && p.nullifyProj == false).sort((a, b) => a.projDiff - b.projDiff).slice(0, 10),
                            seasonOvers: seasonPlayer.filter(p => p.fpts.trans[transType] && p.fpts.trans[transType].starters.weeks > 0 && p.fpts.trans[transType].starters.diff > 0 && p.nullifyProj == false).sort((a, b) => b.fpts.trans[transType].starters.diff - a.fpts.trans[transType].starters.diff).slice(0, 10),
                            seasonUnders: seasonPlayer.filter(p => p.fpts.trans[transType] && p.fpts.trans[transType].starters.weeks > 0 && p.fpts.trans[transType].starters.diff < 0 && p.nullifyProj == false).sort((a, b) => a.fpts.trans[transType].starters.diff - b.fpts.trans[transType].starters.diff).slice(0, 10),
                            managerBests: {},
                        }
                        if(transType == 'waiver') {
                            recordArrays.league.years[year][recordPeriod].acquisitions[transType].bestPickups = seasonPlayer.filter(p => p.fpts.trans[transType] && p.fpts.trans[transType].starters.weeks > 0 && p.price[transType] > 0).sort((a, b) => b.fpts.trans[transType].starters.roi - a.fpts.trans[transType].starters.roi).slice(0, 10);
                            recordArrays.league.years[year][recordPeriod].acquisitions[transType].worstPickups = seasonPlayer.filter(p => p.fpts.trans[transType] && p.fpts.trans[transType].starters.weeks > 0 && p.price[transType] > 0).sort((a, b) => a.fpts.trans[transType].starters.roi - b.fpts.trans[transType].starters.roi).slice(0, 10);
                        } else if(transType == 'draft') {
                            recordArrays.league.years[year][recordPeriod].acquisitions[transType].bestDraftees = seasonPlayer.filter(p => p.fpts.trans[transType] && p.fpts.trans[transType].starters.weeks > 0).sort((a, b) => b.fpts.trans[transType].starters.roi - a.fpts.trans[transType].starters.roi).slice(0, 10);
                            recordArrays.league.years[year][recordPeriod].acquisitions[transType].worstDraftees = seasonPlayer.filter(p => p.fpts.trans[transType] && p.fpts.trans[transType].starters.weeks > 0).sort((a, b) => a.fpts.trans[transType].starters.roi - b.fpts.trans[transType].starters.roi).slice(0, 10);
                        }
                        for(const key in recordArrays.league.years[year][recordPeriod].acquisitions[transType]) {
                            if(key != 'managerBests') recordArrays.league.years[year][recordPeriod].acquisitions[transType].managerBests[key] = [];
                        }
                    }
                
                    if(playerMan.length > 0) {

                        recordArrays.managers.years[year][recordPeriod][recordManID].acquisitions[transType] = {
                            weekHighs: playerMan.filter(p => p.howAcquired == transType && p.benched == false).sort((a, b) => b.fpts - a.fpts).slice(0, 10),
                            weekMissedHighs: playerMan.filter(p => p.howAcquired == transType && p.benched == true).sort((a, b) => b.fpts - a.fpts).slice(0, 10),
                            periodHighs: seasonPlayerID.filter(p => p.fpts.trans[transType] && p.fpts.trans[transType].starters.weeks > 0).sort((a, b) => b.fpts.trans[transType].starters.real - a.fpts.trans[transType].starters.real).slice(0, 10),
                            gamesHighs: seasonPlayerID.filter(p => p.fpts.trans[transType] && p.fpts.trans[transType].starters.weeks > 0).sort((a, b) => b.fpts.trans[transType].starters.weeks - a.fpts.trans[transType].starters.weeks).slice(0, 10),
                            overallHighs: seasonPlayerID.filter(p => p.fpts.trans[transType]).sort((a, b) => b.fpts.trans[transType].total.real - a.fpts.trans[transType].total.real).slice(0, 10),
                            overallMissedHighs: seasonPlayerID.filter(p => p.fpts.trans[transType] && p.fpts.trans[transType].bench.weeks > 0).sort((a, b) => b.fpts.trans[transType].bench.real - a.fpts.trans[transType].bench.real).slice(0, 10),
                            weekOvers: playerMan.filter(p => p.howAcquired == transType && p.benched == false && p.projResult == true).sort((a, b) => b.projDiff - a.projDiff).slice(0, 10),
                            weekUnders: playerMan.filter(p => p.howAcquired == transType && p.benched == false && p.projResult == false).sort((a, b) => a.projDiff - b.projDiff).slice(0, 10),
                            seasonOvers: seasonPlayerID.filter(p => p.fpts.trans[transType] && p.fpts.trans[transType].starters.weeks > 0 && p.fpts.trans[transType].starters.diff > 0 && p.nullifyProj == false).sort((a, b) => b.fpts.trans[transType].starters.diff - a.fpts.trans[transType].starters.diff).slice(0, 10),
                            seasonUnders: seasonPlayerID.filter(p => p.fpts.trans[transType] && p.fpts.trans[transType].starters.weeks > 0 && p.fpts.trans[transType].starters.diff < 0 && p.nullifyProj == false).sort((a, b) => a.fpts.trans[transType].starters.diff - b.fpts.trans[transType].starters.diff).slice(0, 10),
                        }	
                        if(transType == 'waiver') {
                            recordArrays.managers.years[year][recordPeriod][recordManID].acquisitions[transType].bestPickups = seasonPlayerID.filter(p => p.fpts.trans[transType] && p.fpts.trans[transType].starters.weeks > 0).sort((a, b) => b.fpts.trans[transType].starters.roi - a.fpts.trans[transType].starters.roi).slice(0, 10);
                            recordArrays.managers.years[year][recordPeriod][recordManID].acquisitions[transType].worstPickups = seasonPlayerID.filter(p => p.fpts.trans[transType] && p.fpts.trans[transType].starters.weeks > 0).sort((a, b) => a.fpts.trans[transType].starters.roi - b.fpts.trans[transType].starters.roi).slice(0, 10);
                        } else if(transType == 'draft') {
                            recordArrays.managers.years[year][recordPeriod][recordManID].acquisitions[transType].bestDraftees = seasonPlayerID.filter(p => p.fpts.trans[transType] && p.fpts.trans[transType].starters.weeks > 0).sort((a, b) => b.fpts.trans[transType].starters.roi - a.fpts.trans[transType].starters.roi).slice(0, 10);
                            recordArrays.managers.years[year][recordPeriod][recordManID].acquisitions[transType].worstDraftees = seasonPlayerID.filter(p => p.fpts.trans[transType] && p.fpts.trans[transType].starters.weeks > 0).sort((a, b) => a.fpts.trans[transType].starters.roi - b.fpts.trans[transType].starters.roi).slice(0, 10);
                        }
                        for(const key in recordArrays.managers.years[year][recordPeriod][recordManID].acquisitions[transType]) {
                            if(recordArrays.managers.years[year][recordPeriod][recordManID].acquisitions[transType][key].length > 0) recordArrays.league.years[year][recordPeriod].acquisitions[transType].managerBests[key].push(recordArrays.managers.years[year][recordPeriod][recordManID].acquisitions[transType][key][0]);
                        }

                        recordArrays.league.years[year][recordPeriod].acquisitions.leagueAverages[transType].managerAverages.push({
                            recordManID,
                            manager: originalManagers[recordManID],
                            real: seasonManID.fpts.trans[transType].starters.real,
                            realPPG: seasonManID.fpts.trans[transType].starters.realPPG,
                            proj: seasonManID.fpts.trans[transType].starters.proj,
                            projPPG: seasonManID.fpts.trans[transType].starters.projPPG,
                            perc: seasonManID.fpts.trans[transType].starters.perc,
                        })
                        for(const key in recordArrays.league.years[year][recordPeriod].acquisitions.leagueAverages[transType]) {
                            if(key != 'managerAverages') recordArrays.league.years[year][recordPeriod].acquisitions.leagueAverages[transType][key] += seasonManID.fpts.trans[transType].starters[key];
                        }
                    }
                }
            }

            for(const entry of recordArrays.league.years[year][recordPeriod].transactions.trade) {
                if(recordArrays.league.years[year][recordPeriod].transactions.waiver.find(w => w.recordManID == entry.recordManID)) {
                    const waiver = recordArrays.league.years[year][recordPeriod].transactions.waiver.find(w => w.recordManID == entry.recordManID);
                    const freeAgent = recordArrays.league.years[year][recordPeriod].transactions.freeAgent.find(w => w.recordManID == entry.recordManID);
                    const moves = entry.trade + (waiver?.waiver || 0) + (freeAgent?.freeAgent || 0);
                    recordArrays.league.years[year][recordPeriod].transactions.moves.push({
                        recordManID: entry.recordManID,
                        manager: waiver.manager,
                        moves,
                        trade: entry.trade,
                        waiver: waiver?.waiver || 0,
                        outbid: waiver?.outbid || 0,
                        freeAgent: freeAgent?.freeAgent || 0,
                        waiverPerc: waiver?.waiverPerc || 'N/A',
                    })
                }
            }

            for(const position of rosterPositions.years[year]) {
                recordArrays.league.years[year][recordPeriod].positions.leagueAverages[position].managerAverages.sort((a, b) => b.realPPG - a.realPPG);
                recordArrays.league.years[year][recordPeriod].positions.leagueAverages[position].realPPG = recordArrays.league.years[year][recordPeriod].positions.leagueAverages[position].weeks > 0 ? recordArrays.league.years[year][recordPeriod].positions.leagueAverages[position].real / recordArrays.league.years[year][recordPeriod].positions.leagueAverages[position].weeks : 0;
                recordArrays.league.years[year][recordPeriod].positions[position].managerBests.weekHighs.sort((a, b) => b.fpts - a.fpts);
                recordArrays.league.years[year][recordPeriod].positions[position].managerBests.periodHighs.sort((a, b) => b.fpts.starters.real - a.fpts.starters.real);
                recordArrays.league.years[year][recordPeriod].positions[position].managerBests.overallHighs.sort((a, b) => b.fpts.total.real - a.fpts.total.real);
                recordArrays.league.years[year][recordPeriod].positions[position].managerBests.overallMissedHighs.sort((a, b) => b.fpts.bench.real - a.fpts.bench.real);
                recordArrays.league.years[year][recordPeriod].positions[position].managerBests.weekMissedHighs.sort((a, b) => b.fpts - a.fpts);
                recordArrays.league.years[year][recordPeriod].positions[position].managerBests.gamesHighs.sort((a, b) => b.weeks.starters - a.weeks.starters);
                recordArrays.league.years[year][recordPeriod].positions[position].managerBests.weekOvers.sort((a, b) => b.projDiff - a.projDiff);
                recordArrays.league.years[year][recordPeriod].positions[position].managerBests.weekUnders.sort((a, b) => a.projDiff - b.projDiff);
                recordArrays.league.years[year][recordPeriod].positions[position].managerBests.seasonOvers.sort((a, b) => b.fpts.starters.diff - a.fpts.starters.diff);
                recordArrays.league.years[year][recordPeriod].positions[position].managerBests.seasonUnders.sort((a, b) => a.fpts.starters.diff - b.fpts.starters.diff);
            }
            for(const transType of transTypes) {
                recordArrays.league.years[year][recordPeriod].acquisitions.leagueAverages[transType].managerAverages.sort((a, b) => b.realPPG - a.realPPG);
                recordArrays.league.years[year][recordPeriod].acquisitions.leagueAverages[transType].realPPG = recordArrays.league.years[year][recordPeriod].acquisitions.leagueAverages[transType].real / recordArrays.league.years[year][recordPeriod].acquisitions.leagueAverages[transType].weeks;
                recordArrays.league.years[year][recordPeriod].acquisitions[transType].managerBests.weekHighs.sort((a, b) => b.fpts - a.fpts);
                recordArrays.league.years[year][recordPeriod].acquisitions[transType].managerBests.periodHighs.sort((a, b) => b.fpts.trans[transType].starters.real - a.fpts.trans[transType].starters.real);
                recordArrays.league.years[year][recordPeriod].acquisitions[transType].managerBests.overallHighs.sort((a, b) => b.fpts.trans[transType].total.real - a.fpts.trans[transType].total.real);
                recordArrays.league.years[year][recordPeriod].acquisitions[transType].managerBests.overallMissedHighs.sort((a, b) => b.fpts.trans[transType].bench.real - a.fpts.trans[transType].bench.real);
                recordArrays.league.years[year][recordPeriod].acquisitions[transType].managerBests.weekMissedHighs.sort((a, b) => b.fpts - a.fpts);
                recordArrays.league.years[year][recordPeriod].acquisitions[transType].managerBests.gamesHighs.sort((a, b) => b.fpts.trans[transType].starters.weeks - a.fpts.trans[transType].starters.weeks);
                recordArrays.league.years[year][recordPeriod].acquisitions[transType].managerBests.weekOvers.sort((a, b) => b.projDiff - a.projDiff);
                recordArrays.league.years[year][recordPeriod].acquisitions[transType].managerBests.weekUnders.sort((a, b) => a.projDiff - b.projDiff);
                recordArrays.league.years[year][recordPeriod].acquisitions[transType].managerBests.seasonOvers.sort((a, b) => b.fpts.trans[transType].starters.diff - a.fpts.trans[transType].starters.diff);
                recordArrays.league.years[year][recordPeriod].acquisitions[transType].managerBests.seasonUnders.sort((a, b) => a.fpts.trans[transType].starters.diff - b.fpts.trans[transType].starters.diff);
                if(transType == 'waiver') {
                    recordArrays.league.years[year][recordPeriod].acquisitions[transType].managerBests.bestPickups.sort((a, b) => b.fpts.trans[transType].starters.roi - a.fpts.trans[transType].starters.roi);
                    recordArrays.league.years[year][recordPeriod].acquisitions[transType].managerBests.worstPickups.sort((a, b) => a.fpts.trans[transType].starters.roi - b.fpts.trans[transType].starters.roi);
                } else if(transType == 'draft') {
                    recordArrays.league.years[year][recordPeriod].acquisitions[transType].managerBests.bestDraftees.sort((a, b) => b.fpts.trans[transType].starters.roi - a.fpts.trans[transType].starters.roi);
                    recordArrays.league.years[year][recordPeriod].acquisitions[transType].managerBests.worstDraftees.sort((a, b) => a.fpts.trans[transType].starters.roi - b.fpts.trans[transType].starters.roi);
                }
            }
            for(const key in recordArrays.league.years[year][recordPeriod].transactions) {
                recordArrays.league.years[year][recordPeriod].transactions[key].sort((a, b) => b[key] - a[key]);
            }
            recordArrays.league.years[year][recordPeriod].players.managerBests.weekHighs.sort((a, b) => b.fpts - a.fpts);
            recordArrays.league.years[year][recordPeriod].players.managerBests.weekMissedHighs.sort((a, b) => b.fpts - a.fpts);
            recordArrays.league.years[year][recordPeriod].players.managerBests.periodHighs.sort((a, b) => b.fpts.starters.real - a.fpts.starters.real);
            recordArrays.league.years[year][recordPeriod].players.managerBests.overallHighs.sort((a, b) => b.fpts.total.real - a.fpts.total.real);
            recordArrays.league.years[year][recordPeriod].players.managerBests.overallMissedHighs.sort((a, b) => b.fpts.bench.real - a.fpts.bench.real);
            recordArrays.league.years[year][recordPeriod].players.managerBests.gamesHighs.sort((a, b) => b.weeks.starters - a.weeks.starters);
            recordArrays.league.years[year][recordPeriod].players.managerBests.weekOvers.sort((a, b) => b.projDiff - a.projDiff);
            recordArrays.league.years[year][recordPeriod].players.managerBests.weekUnders.sort((a, b) => a.projDiff - b.projDiff);
            recordArrays.league.years[year][recordPeriod].players.managerBests.seasonOvers.sort((a, b) => b.fpts.starters.diff - a.fpts.starters.diff);
            recordArrays.league.years[year][recordPeriod].players.managerBests.seasonUnders.sort((a, b) => a.fpts.starters.diff - b.fpts.starters.diff);
            recordArrays.league.years[year][recordPeriod].managerBests.weekHighs.sort((a, b) => b.fpts.starters.real - a.fpts.starters.real);	
            recordArrays.league.years[year][recordPeriod].managerBests.weekLows.sort((a, b) => b.fpts.starters.real - a.fpts.starters.real);		
            recordArrays.league.years[year][recordPeriod].managerBests.periodHighs.sort((a, b) => b.fpts.starters.realPPG - a.fpts.starters.realPPG);
            recordArrays.league.years[year][recordPeriod].managerBests.periodLows.sort((a, b) => b.fpts.starters.realPPG - a.fpts.starters.realPPG);
            recordArrays.league.years[year][recordPeriod].managerBests.blowoutBests.sort((a, b) => b.matchDifferential - a.matchDifferential);
            recordArrays.league.years[year][recordPeriod].managerBests.blowoutWorsts.sort((a, b) => a.matchDifferential - b.matchDifferential);
            recordArrays.league.years[year][recordPeriod].managerBests.narrowBests.sort((a, b) => a.matchDifferential - b.matchDifferential);
            recordArrays.league.years[year][recordPeriod].managerBests.narrowWorsts.sort((a, b) => b.matchDifferential - a.matchDifferential);
        
        }
    } // SEASON LOOPS HERE

    // IMPORT HISTORY
    // if(importHistory == true) {
    // 	const historyData = leagueHistory;
    // 	const weekScores = {};
    // 	const importRecords = {};

    // 	for(const key in historyData.managers) {
    // 		const recordManID = historyData.managers[key].recordManID;
    // 		importRecords[recordManID] = {
    // 			years: {},
    // 			fpts: 0,
    // 			fptsAgainst: 0,
    // 			fptspg: 0,
    // 			wins: 0,
    // 			losses: 0,
    // 			ties: 0,
    // 			winPerc: null,
    // 			epeWins: 0,
    // 			epeLosses: 0,
    // 			epeTies: 0,
    // 			epePerc: null,
    // 			topScores: 0,
    // 			bottomScores: 0,
    // 			weekWins: 0,
    // 			weekLosses: 0,
    // 			weekTies: 0,
    // 			medianPerc: null,
    // 		};

    // 		if(!allManagers[recordManID]) {
    // 			allManagers[recordManID] = {
    // 				avatar: `https://sleepercdn.com/images/v2/icons/player_default.webp`,
    // 				name: 'Placeholder',
    // 				realname: leagueRecordManagers[recordManID].name,
    // 			};
    // 		}

    // 		for(const year in historyData.managers[key].years) {
    // 			const yearTotals = historyData.managers[key].years[year]

    // 			importRecords[recordManID].fpts += yearTotals.totalFpts;
    // 			importRecords[recordManID].fptsAgainst += yearTotals.totalFptsAgainst;
    // 			importRecords[recordManID].wins += yearTotals.wins;
    // 			importRecords[recordManID].losses += yearTotals.losses;
    // 			importRecords[recordManID].ties += yearTotals.ties;

    // 			const totalPPG = yearTotals.totalFpts / (yearTotals.wins + yearTotals.losses + yearTotals.ties); 
    // 			const winPerc = (yearTotals.wins + yearTotals.ties / 2) / (yearTotals.wins + yearTotals.losses + yearTotals.ties) * 100;
    // 			const simpleEntry = {
    // 				manager: allManagers[recordManID],
    // 				recordManID: recordManID,
    // 				rosterID: leagueRecordManagers[recordManID].rosterID,
    // 				fpts: yearTotals.totalFpts,
    // 				fptspg: totalPPG,
    // 				fptsAgainst: yearTotals.totalFptsAgainst,
    // 				epeWins: 0,
    // 				epeTies: 0,
    // 				epeLosses: 0,
    // 				epePerc: null,
    // 				weekWins: 0,
    // 				weekLosses: 0,
    // 				weekTies: 0,
    // 				medianPerc: null,
    // 				topScores: 0,
    // 				bottomScores: 0,
    // 				winPerc: winPerc,
    // 				wins: yearTotals.wins,
    // 				losses: yearTotals.losses,
    // 				ties: yearTotals.ties,
    // 				periodDifferential: null,
    // 				weeks: {},
    // 				year: yearTotals.year
    // 			}

    // 			if(importType == 'complex' || importType == 'super') {
    // 				if(!weekScores[yearTotals.year]) {
    // 					weekScores[yearTotals.year] = {};
    // 				}

    // 				for(const week in yearTotals.weeks) {
    // 					const weekTotals = yearTotals.weeks[week];
    
    // 					if(!weekScores[yearTotals.year][weekTotals.week]) {
    // 						weekScores[yearTotals.year][weekTotals.week] = [];
    // 					}
    // 					weekScores[yearTotals.year][weekTotals.week].push(weekTotals.fpts)
    // 					simpleEntry.weeks[weekTotals.week] = weekTotals;
    // 				}
    // 			} 
    // 			if(importType == 'super') {
                    
    // 			}

    // 			importRecords[recordManID].years[yearTotals.year] = simpleEntry;
    // 		}
    // 		importRecords[recordManID].winPerc = (importRecords[recordManID].wins + importRecords[recordManID].ties / 2) / (importRecords[recordManID].wins + importRecords[recordManID].ties + importRecords[recordManID].losses) * 100;
    // 		importRecords[recordManID].fptspg = importRecords[recordManID].fpts / (importRecords[recordManID].wins + importRecords[recordManID].ties + importRecords[recordManID].losses);
    // 	}

    // 	if(importType == 'complex' || importType == 'super') {

    // 		for(const recordManID in importRecords) {

    // 			for(const year in importRecords[recordManID].years) {

    // 				for(const week in weekScores[year]) {

    // 					const compareScore = importRecords[recordManID].years[year].weeks[week].fpts;
    // 					const epeWins = weekScores[year][week].filter(s => s < compareScore).length;
    // 					const epeLosses = weekScores[year][week].filter(s => s > compareScore).length;
    // 					const epeTies = weekScores[year][week].filter(s => s == compareScore).length - 1;

    // 					importRecords[recordManID].years[year].epeWins += epeWins;
    // 					importRecords[recordManID].years[year].epeLosses += epeLosses;
    // 					importRecords[recordManID].years[year].epeTies += epeTies;
    // 					importRecords[recordManID].epeWins += epeWins;
    // 					importRecords[recordManID].epeLosses += epeLosses;
    // 					importRecords[recordManID].epeTies += epeTies;

    // 					if(epeWins == 0) {
    // 						importRecords[recordManID].years[year].bottomScores++;
    // 						importRecords[recordManID].bottomScores++;
    // 					} else if(epeLosses == 0) {
    // 						importRecords[recordManID].years[year].topScores++;
    // 						importRecords[recordManID].topScores++;
    // 					}

    // 					const middleScores = weekScores[year][week].sort((a, b) => b - a).slice(weekScores[year][week].length / 2 - 1, weekScores[year][week].length / 2 + 1);
    // 					const medianScore = (middleScores[0] + middleScores[1]) / 2;
    // 					if(compareScore > medianScore) {
    // 						importRecords[recordManID].years[year].weekWins++;
    // 						importRecords[recordManID].weekWins++;
    // 					} else if(compareScore < medianScore) {
    // 						importRecords[recordManID].years[year].weekLosses++;
    // 						importRecords[recordManID].weekLosses++; 
    // 					} else if(compareScore == medianScore) {
    // 						importRecords[recordManID].years[year].weekTies++;
    // 						importRecords[recordManID].weekTies++;
    // 					}
    // 				}
    // 				importRecords[recordManID].years[year].epePerc = (importRecords[recordManID].years[year].epeWins + importRecords[recordManID].years[year].epeTies / 2) / (importRecords[recordManID].years[year].epeWins + importRecords[recordManID].years[year].epeTies + importRecords[recordManID].years[year].epeLosses) * 100;
    // 				importRecords[recordManID].years[year].medianPerc = (importRecords[recordManID].years[year].weekWins + importRecords[recordManID].years[year].weekTies / 2) / (importRecords[recordManID].years[year].weekWins + importRecords[recordManID].years[year].weekTies + importRecords[recordManID].years[year].weekLosses) * 100;
    // 			}
    // 			importRecords[recordManID].epePerc = (importRecords[recordManID].epeWins + importRecords[recordManID].epeTies / 2) / (importRecords[recordManID].epeWins + importRecords[recordManID].epeTies + importRecords[recordManID].epeLosses) * 100;
    // 			importRecords[recordManID].medianPerc = (importRecords[recordManID].weekWins + importRecords[recordManID].weekTies / 2) / (importRecords[recordManID].weekWins + importRecords[recordManID].weekTies + importRecords[recordManID].weekLosses) * 100;
    // 		}

    // 	} else if(importType == 'super') {

    // 	}


    // }

    // calculate all-time records involving multi-season cumulative stats
    for(const recordPeriod of recordPeriods) {
        masterRecordBook.careers.players[recordPeriod] = [];
        masterRecordBook.careers.managers[recordPeriod] = [];

        if(masterRecordBook.seasons.managers[recordPeriod].length > 0) {
            for(const recordManID in allManagers) {
                let recordMan = masterRecordBook.seasons.managers[recordPeriod].filter(w => w.recordManID == recordManID);
                if(recordMan.length == 0) continue;
                let recordPlayer = masterRecordBook.seasons.players[recordPeriod].filter(w => w.recordManID == recordManID);
                
                const comboEntry = {
                    manager: allManagers[recordManID],
                    recordManID,
                    rosterID: recordMan[0].rosterID,
                    optimalProj: 0,
                    beatOptProj: 0,
                    beatProj: 0,
                    perfects: 0,
                    fpts: {
                        pos: {},
                        trans: {},
                        transPos: {},
                    },
                    outcomes: {},
                    margins: {},
                }
                for(const recordType of recordTypes) {
                    comboEntry.outcomes[recordType] = {};
                    if(recordType.includes('EPE')) {
                        comboEntry.outcomes[recordType].top = 0;
                        comboEntry.outcomes[recordType].bottom = 0;
                    };
                    for(const outcomeType of outcomeTypes) {
                        if(outcomeType == 'T' && (recordType == 'upsets')) continue;
                        comboEntry.outcomes[recordType][outcomeType] = 0;
                    }
                }
                for(const playerType of playerTypes) {
                    comboEntry.fpts[playerType] = {
                        real: 0,
                        proj: 0,
                    }
                    if(playerType == 'starters' || playerType == 'opp') comboEntry.fpts[playerType].poss = 0;

                    for(const transType of transTypes) {
                        if(!comboEntry.fpts.trans[transType]) {
                            comboEntry.fpts.trans[transType] = {};
                            comboEntry.fpts.transPos[transType] = {};
                        }
                        comboEntry.fpts.trans[transType][playerType] = {
                            real: 0,
                            proj: 0,
                            weeks: 0,
                        }
                    }
                
                    for(const position of rosterPositions.alltime) {
                        if(!comboEntry.fpts.pos[position]) {
                            comboEntry.fpts.pos[position] = {};
                            for(const transType of transTypes) {
                                comboEntry.fpts.transPos[transType][position] = {};
                            }
                        }
                        comboEntry.fpts.pos[position][playerType] = {
                            real: 0,
                            proj: 0,
                            weeks: 0,
                        }
                        for(const transType of transTypes) {
                            comboEntry.fpts.transPos[transType][position][playerType] = {
                                real: 0,
                                proj: 0,
                                weeks: 0,
                            }
                        }
                    }
                }
                // looping thru totals from each regSeason, playoff, & combined regSeason+playoff period
                for(let i = 0; i < recordMan.length; i++) {
                    // add all basic counting stats (projection-related)
                    for(const key in comboEntry) {
                        if(isNaN(comboEntry[key]) == false && key != 'rosterID' && key != 'recordManID') comboEntry[key] += recordMan[i][key];
                    }
                    // add points-related stats
                    for(const playerType of playerTypes) {
                        for(const score in comboEntry.fpts[playerType]) {
                            comboEntry.fpts[playerType][score] += recordMan[i].fpts[playerType][score];
                        }
                        for(const score in comboEntry.fpts.trans['draft'][playerType]) {
                            for(const transType of transTypes) {
                                comboEntry.fpts.trans[transType][playerType][score] += recordMan[i].fpts.trans[transType][playerType][score];
                            }
                            for(const position of rosterPositions.alltime) {
                                comboEntry.fpts.pos[position][playerType][score] += recordMan[i].fpts.pos[position][playerType][score];
                                for(const transType of transTypes) {
                                    comboEntry.fpts.transPos[transType][position][playerType][score] += recordMan[i].fpts.transPos[transType][position][playerType][score];
                                }
                            }
                        }
                    }
                    // add league median stats for the period
                    const numScores = masterRecordBook.weeks.managers.filter(w => w.year == recordMan[i].year).length;
                    const scoresArray = masterRecordBook.weeks.managers.filter(w => w.year == recordMan[i].year).sort((a, b) => b.fpts.starters.real - a.fpts.starters.real).slice(numScores / 2 - 1, numScores / 2 + 1);
                    const medianScore = (scoresArray[0].fpts.starters.real + scoresArray[1].fpts.starters.real) / 2;
                    recordMan[i].outcomes.seasonMedian = recordMan[i].fpts.starters.real > medianScore ? 'W' : recordMan[i].fpts.starters.real < medianScore ? 'L' : 'T';
                    comboEntry.margins.seasonMedian = {
                        marg: recordMan[i].fpts.starters.real - medianScore,
                    }
                    // add margin stats
                    for(const margin in recordMan[i].margins) {
                        if(!comboEntry.margins[margin]) {
                            comboEntry.margins[margin] = {
                                marg: 0,
                                denom: 0,
                            };
                        }
                        comboEntry.margins[margin].marg += recordMan[i].margins[margin].marg;
                        comboEntry.margins[margin].denom += recordMan[i].margins[margin].marg / recordMan[i].margins[margin].mpg;
                    }
                    // add outcome stats
                    for(const recordType of recordTypes) {
                        for(const outcomeType in comboEntry.outcomes[recordType]) {
                            comboEntry.outcomes[recordType][outcomeType] += recordMan[i].outcomes[recordType][outcomeType];
                        }
                    }
                }
                // calculate cumulative-outcome stats
                for(const recordType of recordTypes) {
                    comboEntry.outcomes[recordType].perc = (comboEntry.outcomes[recordType].W + comboEntry.outcomes[recordType].T / 2) / (comboEntry.outcomes[recordType].W + comboEntry.outcomes[recordType].T + comboEntry.outcomes[recordType].L) * 100;
                    for(const opponent in headToHeadRecords[recordPeriod].alltime[recordManID]) {
                        headToHeadRecords[recordPeriod].alltime[recordManID][opponent].outcomes[recordType].perc = (headToHeadRecords[recordPeriod].alltime[recordManID][opponent].outcomes[recordType].W + headToHeadRecords[recordPeriod].alltime[recordManID][opponent].outcomes[recordType].T / 2) / (headToHeadRecords[recordPeriod].alltime[recordManID][opponent].outcomes[recordType].W + headToHeadRecords[recordPeriod].alltime[recordManID][opponent].outcomes[recordType].T + headToHeadRecords[recordPeriod].alltime[recordManID][opponent].outcomes[recordType].L) * 100;
                    }
                }
                // calculate cumulative margin stats
                for(const margin in comboEntry.margins) {
                    if(margin == 'seasonMedian') {
                        comboEntry.margins[margin].mpg = comboEntry.margins[margin].marg / recordMan.length;
                    } else {
                        comboEntry.margins[margin].mpg = comboEntry.margins[margin].marg / comboEntry.margins[margin].denom;
                    }
                }
                // calculate cumulative-points stats
                for(const playerType of playerTypes) {
                    comboEntry.fpts[playerType].realPPG = comboEntry.fpts[playerType].real / recordMan.length;
                    comboEntry.fpts[playerType].projPPG = comboEntry.fpts[playerType].proj / recordMan.length;
                    comboEntry.fpts[playerType].diff = comboEntry.fpts[playerType].real - comboEntry.fpts[playerType].proj;
                    comboEntry.fpts[playerType].diffPG = comboEntry.fpts[playerType].diff / recordMan.length;
                    if(playerType == 'starters' || playerType == 'opp') comboEntry.fpts[playerType].possPPG = comboEntry.fpts[playerType].poss / recordMan.length;
                    

                    for(const opponent in headToHeadRecords[recordPeriod].alltime[recordManID]) {
                        const numMatches = headToHeadRecords[recordPeriod].alltime[recordManID][opponent].outcomes.match.W + headToHeadRecords[recordPeriod].alltime[recordManID][opponent].outcomes.match.T + headToHeadRecords[recordPeriod].alltime[recordManID][opponent].outcomes.match.L;
                        headToHeadRecords[recordPeriod].alltime[recordManID][opponent].fpts[playerType].realPPG = headToHeadRecords[recordPeriod].alltime[recordManID][opponent].fpts[playerType].real / numMatches;
                        headToHeadRecords[recordPeriod].alltime[recordManID][opponent].fpts[playerType].projPPG = headToHeadRecords[recordPeriod].alltime[recordManID][opponent].fpts[playerType].proj / numMatches;
                        headToHeadRecords[recordPeriod].alltime[recordManID][opponent].fpts[playerType].diff = headToHeadRecords[recordPeriod].alltime[recordManID][opponent].fpts[playerType].real - headToHeadRecords[recordPeriod].alltime[recordManID][opponent].fpts[playerType].proj;
                        headToHeadRecords[recordPeriod].alltime[recordManID][opponent].fpts[playerType].diffPG = headToHeadRecords[recordPeriod].alltime[recordManID][opponent].fpts[playerType].diff / numMatches;
                        if(playerType == 'starters' || playerType == 'opp') headToHeadRecords[recordPeriod].alltime[recordManID][opponent].fpts[playerType].possPPG = headToHeadRecords[recordPeriod].alltime[recordManID][opponent].fpts[playerType].poss / numMatches;
                    }
                    for(const position of rosterPositions.alltime) {
                        comboEntry.fpts.pos[position][playerType].realPPG = comboEntry.fpts.pos[position][playerType].real / comboEntry.fpts.pos[position][playerType].weeks;
                        comboEntry.fpts.pos[position][playerType].projPPG = comboEntry.fpts.pos[position][playerType].proj / comboEntry.fpts.pos[position][playerType].weeks;
                        comboEntry.fpts.pos[position][playerType].diff = comboEntry.fpts.pos[position][playerType].real - comboEntry.fpts.pos[position][playerType].proj;
                        comboEntry.fpts.pos[position][playerType].diffPG = comboEntry.fpts.pos[position][playerType].diff / comboEntry.fpts.pos[position][playerType].weeks;
                        if(playerType == 'starters' || playerType == 'opp') comboEntry.fpts.pos[position][playerType].perc = comboEntry.fpts.pos[position][playerType].real / comboEntry.fpts[playerType].real;
                        for(const transType of transTypes) {
                            comboEntry.fpts.transPos[transType][position][playerType].realPPG = comboEntry.fpts.transPos[transType][position][playerType].real / comboEntry.fpts.transPos[transType][position][playerType].weeks;
                            comboEntry.fpts.transPos[transType][position][playerType].projPPG = comboEntry.fpts.transPos[transType][position][playerType].proj / comboEntry.fpts.transPos[transType][position][playerType].weeks;
                            comboEntry.fpts.transPos[transType][position][playerType].diff = comboEntry.fpts.transPos[transType][position][playerType].real - comboEntry.fpts.transPos[transType][position][playerType].proj;
                            comboEntry.fpts.transPos[transType][position][playerType].diffPG = comboEntry.fpts.transPos[transType][position][playerType].diff / comboEntry.fpts.transPos[transType][position][playerType].weeks;
                            if(playerType == 'starters' || playerType == 'opp') {
                                comboEntry.fpts.transPos[transType][position][playerType].percAll = comboEntry.fpts.transPos[transType][position][playerType].real / comboEntry.fpts[playerType].real;
                                comboEntry.fpts.transPos[transType][position][playerType].percPos = comboEntry.fpts.transPos[transType][position][playerType].real / comboEntry.fpts.pos[position][playerType].real;
                                comboEntry.fpts.transPos[transType][position][playerType].percTrans = comboEntry.fpts.transPos[transType][position][playerType].real / comboEntry.fpts.trans[transType][playerType].real;
                            }
                        }
                    }
                    for(const transType of transTypes) {
                        comboEntry.fpts.trans[transType][playerType].realPPG = comboEntry.fpts.trans[transType][playerType].real / comboEntry.fpts.trans[transType][playerType].weeks;
                        comboEntry.fpts.trans[transType][playerType].projPPG = comboEntry.fpts.trans[transType][playerType].proj / comboEntry.fpts.trans[transType][playerType].weeks;
                        comboEntry.fpts.trans[transType][playerType].diff = comboEntry.fpts.trans[transType][playerType].real - comboEntry.fpts.trans[transType][playerType].proj;
                        comboEntry.fpts.trans[transType][playerType].diffPG = comboEntry.fpts.trans[transType][playerType].diff / comboEntry.fpts.trans[transType][playerType].weeks;
                        if(playerType == 'starters' || playerType == 'opp') comboEntry.fpts.trans[transType][playerType].perc = comboEntry.fpts.trans[transType][playerType].real / comboEntry.fpts[playerType].real;
                    }
                }
                for(const opponent in headToHeadRecords[recordPeriod].alltime[recordManID]) {
                    const numMatches = headToHeadRecords[recordPeriod].alltime[recordManID][opponent].outcomes.match.W + headToHeadRecords[recordPeriod].alltime[recordManID][opponent].outcomes.match.T + headToHeadRecords[recordPeriod].alltime[recordManID][opponent].outcomes.match.L;

                    headToHeadRecords[recordPeriod].alltime[recordManID][opponent].margins.match = {
                        marg: headToHeadRecords[recordPeriod].alltime[recordManID][opponent].fpts.starters.real - headToHeadRecords[recordPeriod].alltime[recordManID][opponent].fpts.opp.real,
                        mpg: (headToHeadRecords[recordPeriod].alltime[recordManID][opponent].fpts.starters.real - headToHeadRecords[recordPeriod].alltime[recordManID][opponent].fpts.opp.real) / numMatches,
                    }
                    headToHeadRecords[recordPeriod].alltime[recordManID][opponent].margins.proj = {
                        marg: headToHeadRecords[recordPeriod].alltime[recordManID][opponent].fpts.starters.proj - headToHeadRecords[recordPeriod].alltime[recordManID][opponent].fpts.opp.proj,
                        mpg: (headToHeadRecords[recordPeriod].alltime[recordManID][opponent].fpts.starters.proj - headToHeadRecords[recordPeriod].alltime[recordManID][opponent].fpts.opp.proj) / numMatches,
                    }
                    headToHeadRecords[recordPeriod].alltime[recordManID][opponent].iq = headToHeadRecords[recordPeriod].alltime[recordManID][opponent].fpts.starters.real / headToHeadRecords[recordPeriod].alltime[recordManID][opponent].fpts.starters.poss * 100;
                    // index notable matches
                    headToHeadRecords[recordPeriod].alltime[recordManID][opponent].highScore = headToHeadRecords[recordPeriod].alltime[recordManID][opponent].matchups.indexOf(headToHeadRecords[recordPeriod].alltime[recordManID][opponent].matchups.slice().sort((a, b) => b.fpts.starters.real - a.fpts.starters.real)[0]);
                    headToHeadRecords[recordPeriod].alltime[recordManID][opponent].lowScore = headToHeadRecords[recordPeriod].alltime[recordManID][opponent].matchups.indexOf(headToHeadRecords[recordPeriod].alltime[recordManID][opponent].matchups.slice().sort((a, b) => a.fpts.starters.real - b.fpts.starters.real)[0]);
                    headToHeadRecords[recordPeriod].alltime[recordManID][opponent].bestBlowout = headToHeadRecords[recordPeriod].alltime[recordManID][opponent].matchups.indexOf(headToHeadRecords[recordPeriod].alltime[recordManID][opponent].matchups.slice().sort((a, b) => b.matchDifferential - a.matchDifferential)[0]);
                    headToHeadRecords[recordPeriod].alltime[recordManID][opponent].worstBlowout = headToHeadRecords[recordPeriod].alltime[recordManID][opponent].matchups.indexOf(headToHeadRecords[recordPeriod].alltime[recordManID][opponent].matchups.slice().sort((a, b) => a.matchDifferential - b.matchDifferential)[0]);
                    headToHeadRecords[recordPeriod].alltime[recordManID][opponent].bestNailbiter = headToHeadRecords[recordPeriod].alltime[recordManID][opponent].matchups.indexOf(headToHeadRecords[recordPeriod].alltime[recordManID][opponent].matchups.filter(m => m.matchDifferential >= 0).sort((a, b) => a.matchDifferential - b.matchDifferential)[0]);
                    headToHeadRecords[recordPeriod].alltime[recordManID][opponent].worstNailbiter = headToHeadRecords[recordPeriod].alltime[recordManID][opponent].matchups.indexOf(headToHeadRecords[recordPeriod].alltime[recordManID][opponent].matchups.filter(m => m.matchDifferential <= 0).sort((a, b) => b.matchDifferential - a.matchDifferential)[0]);
                    headToHeadRecords[recordPeriod].alltime[recordManID][opponent].upsetWin = headToHeadRecords[recordPeriod].alltime[recordManID][opponent].matchups.indexOf(headToHeadRecords[recordPeriod].alltime[recordManID][opponent].matchups.filter(m => m.outcomes.upsets == 'W')?.sort((a, b) => b.matchDifferential - a.matchDifferential)[0]);
                    headToHeadRecords[recordPeriod].alltime[recordManID][opponent].upsetLoss = headToHeadRecords[recordPeriod].alltime[recordManID][opponent].matchups.indexOf(headToHeadRecords[recordPeriod].alltime[recordManID][opponent].matchups.filter(m => m.outcomes.upsets == 'L')?.sort((a, b) => a.matchDifferential - b.matchDifferential)[0]);
                }
                // add remaining cumulative stats to comboEntry
                const numMatches = comboEntry.outcomes.match.W + comboEntry.outcomes.match.T + comboEntry.outcomes.match.L;
                
                comboEntry.margins.match = {
                    marg: comboEntry.fpts.starters.real - comboEntry.fpts.opp.real,
                    mpg: (comboEntry.fpts.starters.real - comboEntry.fpts.opp.real) / numMatches,
                }
                comboEntry.margins.proj = {
                    marg: comboEntry.fpts.starters.proj - comboEntry.fpts.opp.proj,
                    mpg: (comboEntry.fpts.starters.proj - comboEntry.fpts.opp.proj) / numMatches,
                }
                comboEntry.margins.median.mpg = comboEntry.margins.median.marg / recordMan.length;

                comboEntry.optimalProjPg = comboEntry.optimalProj / numMatches;
                comboEntry.beatProjPerc = comboEntry.beatProj / numMatches * 100;
                comboEntry.beatOptProjPerc = comboEntry.beatOptProj / numMatches * 100;
                comboEntry.iq = comboEntry.fpts.starters.real / comboEntry.fpts.starters.poss * 100;
                
                // push comboEntry to masterRecordBook
                masterRecordBook.careers.managers[recordPeriod].push(comboEntry);

                // PLAYERS ALL-TIME STATS
                const playerRecords = {};

                for(const key in recordPlayer) {
                    const player = recordPlayer[key];

                    if(!playerRecords[player.playerID]) {
                        playerRecords[player.playerID] = {
                            recordManID,
                            manager: player.manager,
                            rosterID: player.rosterID,
                            playerID: player.playerID,
                            expectations: {
                                exceedProj: {},
                                metProj: {},
                                belowProj: {},
                            },
                            fpts: {
                                teams: {},
                                trans: {},
                            },
                            years: {
                                years: [],
                            },
                            weeks: {
                                weeks: {},
                            },
                            price: {},
                            topStarters: 0,
                            bottomStarters: 0,
                            starterRanks: 0,
                            numStarters: 0,
                            playerInfo: player.playerInfo,
                            nflInfo: player.nflInfo,
                            avatar: player.avatar,
                            rosterSpot: player.rosterSpot,
                            timesDrafted: 0,
                            team: player.team,
                            nullifyProj: player.nullifyProj,
                        }
                        for(const playerType of playerTypes) {
                            if(playerType == 'opp') continue;
                            for(const expectation in playerRecords[player.playerID].expectations) {
                                playerRecords[player.playerID].expectations[expectation][playerType] = {
                                    diff: 0,
                                    weeks: 0,
                                }
                            }
                            playerRecords[player.playerID].fpts[playerType] = {
                                proj: 0,
                                real: 0,
                            }
                            playerRecords[player.playerID].weeks[playerType] = 0;
                            playerRecords[player.playerID].years[playerType] = 0;
                        }
                    }
                    const playerRecord = playerRecords[player.playerID];
                    if(!playerRecord.years.years.includes(player.year)) playerRecord.years.years.push(player.year);
                    if(!playerRecord.weeks.weeks[player.year]) playerRecord.weeks.weeks[player.year] = [];
                    for(const week of player.weeks.weeks) {
                        playerRecord.weeks.weeks[player.year].push(week);
                    }

                    if(playerRecord.team == null) playerRecord.team = player.team;
                    if(playerRecord.rosterSpot == null || playerRecord.rosterSpot.includes('FLEX')) playerRecord.rosterSpot = player.rosterSpot;
                    if(player.drafted == true) playerRecord.timesDrafted++;
                    if(player.nullifyProj == true && playerRecord.nullifyProj == false) playerRecord.nullifyProj == true;

                    for(const stat in playerRecord) {
                        if(isNaN(playerRecord[stat]) == false && stat != 'nullifyProj' && stat != 'timesDrafted' && stat != 'rosterSpot' && stat != 'rosterID' && stat != 'playerID' && stat != 'recordManID') playerRecord[stat] += player[stat];
                    }

                    for(const playerType of playerTypes) {
                        if(playerType == 'opp') continue;
                        
                        playerRecord.weeks[playerType] += player.weeks[playerType];
                        if(player.weeks[playerType] > 0) playerRecord.years[playerType]++;

                        for(const score in playerRecords[player.playerID].fpts[playerType]) {
                            playerRecords[player.playerID].fpts[playerType][score] += player.fpts[playerType][score];
                        }

                        for(const transType in player.fpts.trans) {

                            if(!playerRecord.fpts.trans[transType]) playerRecord.fpts.trans[transType] = {};
                            if(!playerRecord.fpts.trans[transType][playerType]) {
                                playerRecord.fpts.trans[transType][playerType] = {
                                    real: 0,
                                    proj: 0,
                                    weeks: 0,
                                }
                            }
                            playerRecord.fpts.trans[transType][playerType].real += player.fpts.trans[transType][playerType].real;
                            playerRecord.fpts.trans[transType][playerType].proj += player.fpts.trans[transType][playerType].proj;
                            playerRecord.fpts.trans[transType][playerType].weeks += player.fpts.trans[transType][playerType].weeks;
                        }
                    
                        for(const team in player.fpts.teams) {
                            if(!playerRecord.fpts.teams[team]) playerRecord.fpts.teams[team] = {};
                            if(!playerRecord.fpts.teams[team][playerType]) {
                                playerRecord.fpts.teams[team][playerType] = {
                                    real: 0,
                                    proj: 0,
                                    weeks: 0,
                                }
                            }  
                            playerRecord.fpts.teams[team][playerType].real += player.fpts.teams[team][playerType].real;
                            playerRecord.fpts.teams[team][playerType].proj += player.fpts.teams[team][playerType].proj;
                            playerRecord.fpts.teams[team][playerType].weeks += player.fpts.teams[team][playerType].weeks;
                        }
                        for(const exp in player.expectations) {
                            if(!playerRecord.expectations[exp]) playerRecord.expectations[exp] = {};
                            if(!playerRecord.expectations[exp][playerType]) {
                                playerRecord.expectations[exp][playerType] = {
                                    diff: 0,
                                    weeks: 0,
                                }
                            }
                            playerRecord.expectations[exp][playerType].diff += player.expectations[exp][playerType].diff;
                            playerRecord.expectations[exp][playerType].weeks += player.expectations[exp][playerType].weeks;
                        }
                    }
                }

                for(const playerID in playerRecords) {                

                    playerRecords[playerID].starterRankAVG = playerRecords[playerID].weeks.starters > 0 ? playerRecords[playerID].starterRanks / playerRecords[playerID].weeks.starters : null;

                    for(const playerType of playerTypes) {
                        if(playerType == 'opp') continue;
                        for(const team in playerRecords[playerID].fpts.teams) {
                            playerRecords[playerID].fpts.teams[team][playerType].realPPG = playerRecords[playerID].fpts.teams[team][playerType].real / playerRecords[playerID].fpts.teams[team][playerType].weeks;
                            playerRecords[playerID].fpts.teams[team][playerType].projPPG = playerRecords[playerID].fpts.teams[team][playerType].proj / playerRecords[playerID].fpts.teams[team][playerType].weeks;
                            playerRecords[playerID].fpts.teams[team][playerType].diff = playerRecords[playerID].fpts.teams[team][playerType].real - playerRecords[playerID].fpts.teams[team][playerType].proj;
                            playerRecords[playerID].fpts.teams[team][playerType].diffPG = playerRecords[playerID].fpts.teams[team][playerType].diff / playerRecords[playerID].fpts.teams[team][playerType].weeks;
                        }
                        for(const transType in playerRecords[playerID].fpts.trans) {
                            playerRecords[playerID].fpts.trans[transType][playerType].realPPG = playerRecords[playerID].fpts.trans[transType][playerType].real / playerRecords[playerID].fpts.trans[transType][playerType].weeks;
                            playerRecords[playerID].fpts.trans[transType][playerType].projPPG = playerRecords[playerID].fpts.trans[transType][playerType].proj / playerRecords[playerID].fpts.trans[transType][playerType].weeks;
                            playerRecords[playerID].fpts.trans[transType][playerType].diff = playerRecords[playerID].fpts.trans[transType][playerType].real - playerRecords[playerID].fpts.trans[transType][playerType].proj;
                            playerRecords[playerID].fpts.trans[transType][playerType].diffPG = playerRecords[playerID].fpts.trans[transType][playerType].diff / playerRecords[playerID].fpts.trans[transType][playerType].weeks;
                        } 
                        for(const expectation in playerRecords[playerID].expectations) {
                            playerRecords[playerID].expectations[expectation][playerType].diffPG = playerRecords[playerID].expectations[expectation][playerType].diff / playerRecords[playerID].expectations[expectation][playerType].weeks;
                        }
                        playerRecords[playerID].fpts[playerType].realPPG = playerRecords[playerID].fpts[playerType].real / playerRecords[playerID].weeks[playerType];
                        playerRecords[playerID].fpts[playerType].projPPG = playerRecords[playerID].fpts[playerType].proj / playerRecords[playerID].weeks[playerType];
                        playerRecords[playerID].fpts[playerType].diff = playerRecords[playerID].fpts[playerType].real - playerRecords[playerID].fpts[playerType].proj;
                        playerRecords[playerID].fpts[playerType].diffPG = playerRecords[playerID].fpts[playerType].diff / playerRecords[playerID].weeks[playerType]; 
                    }    
                    masterRecordBook.careers.players[recordPeriod].push(playerRecords[playerID]);
                }
            }
        }
    }
    for(const recordPeriod of recordPeriods) {

        if(masterRecordBook.seasons.managers[recordPeriod].length == 0) continue;

        recordArrays.managers.alltime[recordPeriod] = {};
        let seasonMan = masterRecordBook.seasons.managers[recordPeriod];
        let seasonPlayer = masterRecordBook.seasons.players[recordPeriod];
        let careerPlayer = masterRecordBook.careers.players[recordPeriod];
        let careerMan = masterRecordBook.careers.managers[recordPeriod];
        let weekPlayer = masterRecordBook.weeks.players;
        let weekMan = masterRecordBook.weeks.managers;
        if(recordPeriod == 'regular') {
            weekPlayer = weekPlayer.filter(w => w.period == 'regular');
            weekMan = weekMan.filter(w => w.period == 'regular');
        } else if(recordPeriod == 'playoffs') {
            weekPlayer = weekPlayer.filter(w => w.period == 'playoffs');
            weekMan = weekMan.filter(w => w.period == 'playoffs');
        } 

        recordArrays.league.alltime[recordPeriod] = {
            weekHighs: weekMan.slice().sort((a, b) => b.fpts.starters.real - a.fpts.starters.real).slice(0, 10),
            weekLows: weekMan.slice().sort((a, b) => a.fpts.starters.real - b.fpts.starters.real).slice(0, 10),
            periodHighs: seasonMan.slice().sort((a, b) => b.fpts.starters.realPPG - a.fpts.starters.realPPG).slice(0, 10),
            periodLows: seasonMan.slice().sort((a, b) => a.fpts.starters.realPPG - b.fpts.starters.realPPG).slice(0, 10),
            biggestBlowouts: weekMan.filter(v => v.matchDifferential >= 0).sort((a, b) => b.matchDifferential - a.matchDifferential).slice(0, 10),
            narrowestVictories: weekMan.filter(v => v.matchDifferential >= 0).sort((a, b) => a.matchDifferential - b.matchDifferential).slice(0, 10),
            managerBests: {
                epeRecords: careerMan.slice().sort((a, b) => b.outcomes.EPE.perc - a.outcomes.EPE.perc),
                bestBalls: careerMan.slice().sort((a, b) => b.outcomes.bball.perc - a.outcomes.bball.perc),
                medianRecords: careerMan.slice().sort((a, b) => b.outcomes.median.perc - a.outcomes.median.perc),
                fptsHistories: careerMan.slice().sort((a, b) => b.fpts.starters.real - a.fpts.starters.real),
                winRecords: careerMan.slice().sort((a, b) => b.outcomes.match.perc - a.outcomes.match.perc),
                lineupIqs: careerMan.slice().sort((a, b) => b.iq - a.iq),
                fptsPoss: careerMan.slice().sort((a, b) => b.fpts.starters.poss - a.fpts.starters.poss),
                projRecords: careerMan.slice().sort((a, b) => b.fpts.starters.proj - a.fpts.starters.proj),
                blowoutBests: [],
                blowoutWorsts: [],
                narrowBests: [],
                narrowWorsts: [],
            },
            players: {
                overallMissedHighs: careerPlayer.filter(p => p.weeks.bench > 0).sort((a, b) => b.fpts.bench.real - a.fpts.bench.real).slice(0, 10),
                overallHighs: careerPlayer.filter(p => p.weeks.starters > 0).sort((a, b) => b.fpts.starters.real - a.fpts.starters.real).slice(0, 10),
                periodHighs: seasonPlayer.filter(p => p.weeks.starters > 0).sort((a, b) => b.fpts.starters.real - a.fpts.starters.real).slice(0, 10),	
                gamesHighs: careerPlayer.filter(p => p.weeks.starters > 0).sort((a, b) => b.weeks.starters - a.weeks.starters).slice(0, 10),	
                weekHighs: weekPlayer.filter(p => p.benched == false).sort((a, b) => b.fpts - a.fpts).slice(0, 10),
                weekMissedHighs: weekPlayer.filter(p => p.benched == true).sort((a, b) => b.fpts - a.fpts).slice(0, 10),
                weekOvers: weekPlayer.filter(p => p.benched == false && p.projResult == true && p.nullifyProj == false).sort((a, b) => b.projDiff - a.projDiff).slice(0, 10),
                weekUnders: weekPlayer.filter(p => p.benched == false && p.projResult == false && p.nullifyProj == false).sort((a, b) => a.projDiff - b.projDiff).slice(0, 10),
                seasonOvers: seasonPlayer.filter(p => p.weeks.starters > 0 && p.fpts.starters.diff > 0 && p.nullifyProj == false).sort((a, b) => b.fpts.starters.diff - a.fpts.starters.diff).slice(0, 10),
                seasonUnders: seasonPlayer.filter(p => p.weeks.starters > 0 && p.fpts.starters.diff < 0 && p.nullifyProj == false).sort((a, b) => a.fpts.starters.diff - b.fpts.starters.diff).slice(0, 10),
                managerBests: {},
            },
            positions: {
                leagueAverages: {},
            },
            acquisitions: {
                leagueAverages: {},
            },
            transactions: {
                moves: [],
                trade: [],
                waiver: [],
                freeAgent: [],
                wires: [],
            },
        };
        for(const key in recordArrays.league.alltime[recordPeriod]) {
            if(key != 'transactions' && key != 'managerBests' && key != 'biggestBlowouts' && key != 'narrowestVictories' && key != 'players' && key != 'positions' && key != 'acquisitions') recordArrays.league.alltime[recordPeriod].managerBests[key] = [];
        }
        for(const key in recordArrays.league.alltime[recordPeriod].players) {
            if(key != 'managerBests') recordArrays.league.alltime[recordPeriod].players.managerBests[key] = [];
        }

        for(const recordManID in allManagers) {
            let recordID = weekMan.filter(w => w.recordManID == recordManID);
            let playerMan = weekPlayer.filter(w => w.recordManID == recordManID);
            let career = careerMan.find(p => p.recordManID == recordManID);
            let careerPlayerID = careerPlayer.filter(p => p.recordManID == recordManID);
            let seasonManID = seasonMan.filter(s => s.recordManID == recordManID);
            let seasonPlayerID = seasonPlayer.filter(p => p.recordManID == recordManID);

            if(transactionsInfo.totals[recordManID]) {
                for(const key in recordArrays.league.alltime[recordPeriod].transactions) {
                    if(key == 'moves') continue;
                    const entry = {
                        recordManID,
                        manager: allManagers[recordManID],
                    }
                    if(key == 'wires') {
                        if(recordPeriod == 'combined') {
                            entry[key] = transactionsInfo.totals[recordManID].regular.waiver + transactionsInfo.totals[recordManID].regular.freeAgent + transactionsInfo.totals[recordManID].playoffs.waiver + transactionsInfo.totals[recordManID].playoffs.freeAgent;
                        } else if(recordPeriod == 'regular') {
                            entry[key] = transactionsInfo.totals[recordManID].regular.waiver + transactionsInfo.totals[recordManID].regular.freeAgent
                        } else {
                            entry[key] = transactionsInfo.totals[recordManID].playoffs.waiver + transactionsInfo.totals[recordManID].playoffs.freeAgent;
                        }
                    } else {
                        entry[key] = recordPeriod == 'combined' ? transactionsInfo.totals[recordManID].regular[key] + transactionsInfo.totals[recordManID].playoffs[key] : transactionsInfo.totals[recordManID][recordPeriod][key];
                    }
                    if(key == 'waiver') {
                        entry.outbid = recordPeriod == 'combined' ? transactionsInfo.totals[recordManID].regular.outbid + transactionsInfo.totals[recordManID].playoffs.outbid : transactionsInfo.totals[recordManID][recordPeriod].outbid;
                        entry.waiverPerc = entry.waiver + entry.outbid > 0 ? entry.waiver / (entry.waiver + entry.outbid) * 100 : 'N/A';
                    }
                }
            }

            if(recordID.length > 0) {

                recordArrays.managers.alltime[recordPeriod][recordManID] = {
                    weekHighs: recordID.slice().sort((a, b) => b.fpts.starters.real - a.fpts.starters.real).slice(0, 10),
                    weekLows: recordID.slice().sort((a, b) => a.fpts.starters.real - b.fpts.starters.real).slice(0, 10),
                    periodHighs: seasonManID.slice().sort((a, b) => b.fpts.starters.realPPG - a.fpts.starters.realPPG).slice(0, 10),
                    periodLows: seasonManID.slice().sort((a, b) => a.fpts.starters.realPPG - b.fpts.starters.realPPG).slice(0, 10),
                    blowoutBests: recordID.filter(v => v.matchDifferential >= 0).sort((a, b) => b.matchDifferential - a.matchDifferential).slice(0, 10),
                    blowoutWorsts: recordID.filter(v => v.matchDifferential <= 0).sort((a, b) => a.matchDifferential - b.matchDifferential).slice(0, 10),
                    narrowBests: recordID.filter(v => v.matchDifferential >= 0).sort((a, b) => a.matchDifferential - b.matchDifferential).slice(0, 10),
                    narrowWorsts: recordID.filter(v => v.matchDifferential <= 0).sort((a, b) => b.matchDifferential - a.matchDifferential).slice(0, 10),
                    headToHeads: [],
                    players: {
                        weekHighs: playerMan.filter(p => p.benched == false).sort((a, b) => b.fpts - a.fpts).slice(0, 10),
                        weekMissedHighs: playerMan.filter(p => p.benched == true).sort((a, b) => b.fpts - a.fpts).slice(0, 10),
                        periodHighs: seasonPlayerID.filter(p => p.weeks.starters > 0).sort((a, b) => b.fpts.starters.real - a.fpts.starters.real).slice(0, 10),
                        overallHighs: careerPlayerID.filter(p => p.weeks.starters > 0).sort((a, b) => b.fpts.starters.real - a.fpts.starters.real).slice(0, 10),
                        gamesHighs: careerPlayerID.filter(p => p.weeks.starters > 0).sort((a, b) => b.weeks.starters - a.weeks.starters).slice(0, 10),
                        overallMissedHighs: careerPlayerID.filter(p => p.weeks.bench > 0).sort((a, b) => b.fpts.bench.real - a.fpts.bench.real).slice(0, 10),
                        weekOvers: playerMan.filter(p => p.benched == false && p.projResult == true && p.nullifyProj == false).sort((a, b) => b.projDiff - a.projDiff).slice(0, 10),
                        weekUnders: playerMan.filter(p => p.benched == false && p.projResult == false && p.nullifyProj == false).sort((a, b) => a.projDiff - b.projDiff).slice(0, 10),
                        seasonOvers: seasonPlayerID.filter(p => p.weeks.starters > 0 && p.fpts.starters.diff > 0 && p.nullifyProj == false).sort((a, b) => b.fpts.starters.diff - a.fpts.starters.diff).slice(0, 10),
                        seasonUnders: seasonPlayerID.filter(p => p.weeks.starters > 0 && p.fpts.starters.diff < 0 && p.nullifyProj == false).sort((a, b) => a.fpts.starters.diff - b.fpts.starters.diff).slice(0, 10),                    },
                    positions: {},
                    acquisitions: {},
                };

                for(const opponent in headToHeadRecords[recordPeriod].alltime[recordManID]) {
                    recordArrays.managers.alltime[recordPeriod][recordManID].headToHeads.push(headToHeadRecords[recordPeriod].alltime[recordManID][opponent]);
                }
                recordArrays.managers.alltime[recordPeriod][recordManID].headToHeads.sort((a, b) => b.winPerc - a.winPerc);

                for(const key in recordArrays.managers.alltime[recordPeriod][recordManID].players) {
                    if(recordArrays.managers.alltime[recordPeriod][recordManID].players[key].length > 0) recordArrays.league.alltime[recordPeriod].players.managerBests[key].push(recordArrays.managers.alltime[recordPeriod][recordManID].players[key][0]);
                }
                for(const key in recordArrays.managers.alltime[recordPeriod][recordManID]) {
                    if(recordArrays.managers.alltime[recordPeriod][recordManID][key].length > 0 && key != 'headToHeads' && key != 'players' && key != 'positions' && key != 'acquisitions') recordArrays.league.alltime[recordPeriod].managerBests[key].push(recordArrays.managers.alltime[recordPeriod][recordManID][key][0]);
                }
            }

            for(const position of rosterPositions.alltime) {
                if(!recordArrays.league.alltime[recordPeriod].positions.leagueAverages[position]) { 
                    recordArrays.league.alltime[recordPeriod].positions.leagueAverages[position] = {
                        real: 0,
                        proj: 0,
                        weeks: 0,
                        managerAverages: [],
                    }
                    recordArrays.league.alltime[recordPeriod].positions[position] = {
                        weekHighs: weekPlayer.filter(p => p.playerInfo.pos == position && p.benched == false).sort((a, b) => b.fpts - a.fpts).slice(0, 10),
                        weekMissedHighs: weekPlayer.filter(p => p.playerInfo.pos == position && p.benched == true).sort((a, b) => b.fpts - a.fpts).slice(0, 10),
                        periodHighs: seasonPlayer.filter(p => p.playerInfo.pos == position && p.weeks.starters > 0).sort((a, b) => b.fpts.starters.real - a.fpts.starters.real).slice(0, 10),
                        overallHighs: careerPlayer.filter(p => p.playerInfo.pos == position && p.weeks.starters > 0).sort((a, b) => b.fpts.starters.real - a.fpts.starters.real).slice(0, 10),
                        gamesHighs: careerPlayer.filter(p => p.playerInfo.pos == position && p.weeks.starters > 0).sort((a, b) => b.weeks.starters - a.weeks.starters).slice(0, 10),
                        overallMissedHighs: careerPlayer.filter(p => p.playerInfo.pos == position && p.weeks.bench > 0).sort((a, b) => b.fpts.bench.real - a.fpts.bench.real).slice(0, 10),
                        weekOvers: weekPlayer.filter(p => p.playerInfo.pos == position && p.benched == false && p.projResult == true && p.nullifyProj == false).sort((a, b) => b.projDiff - a.projDiff).slice(0, 10),
                        weekUnders: weekPlayer.filter(p => p.playerInfo.pos == position && p.benched == false && p.projResult == false && p.nullifyProj == false).sort((a, b) => a.projDiff - b.projDiff).slice(0, 10),
                        seasonOvers: seasonPlayer.filter(p => p.playerInfo.pos == position && p.weeks.starters > 0 && p.fpts.starters.diff > 0 && p.nullifyProj == false).sort((a, b) => b.fpts.starters.diff - a.fpts.starters.diff).slice(0, 10),
                        seasonUnders: seasonPlayer.filter(p => p.playerInfo.pos == position && p.weeks.starters > 0 && p.fpts.starters.diff < 0 && p.nullifyProj == false).sort((a, b) => a.fpts.starters.diff - b.fpts.starters.diff).slice(0, 10),
                        managerBests: {},
                    }
                    for(const key in recordArrays.league.alltime[recordPeriod].positions[position]) {
                        if(key != 'managerBests') recordArrays.league.alltime[recordPeriod].positions[position].managerBests[key] = [];
                    }
                }
                
                if(playerMan.length > 0) {

                    recordArrays.managers.alltime[recordPeriod][recordManID].positions[position] = {
                        weekHighs: playerMan.filter(p => p.playerInfo.pos == position && p.benched == false).sort((a, b) => b.fpts - a.fpts).slice(0, 10),
                        weekMissedHighs: playerMan.filter(p => p.playerInfo.pos == position && p.benched == true).sort((a, b) => b.fpts - a.fpts).slice(0, 10),
                        periodHighs: seasonPlayerID.filter(p => p.playerInfo.pos == position && p.weeks.starters > 0).sort((a, b) => b.fpts.starters.real - a.fpts.starters.real).slice(0, 10),
                        gamesHighs: careerPlayerID.filter(p => p.playerInfo.pos == position && p.weeks.starters > 0).sort((a, b) => b.weeks.starters - a.weeks.starters).slice(0, 10),
                        overallHighs: careerPlayerID.filter(p => p.playerInfo.pos == position && p.weeks.starters > 0).sort((a, b) => b.fpts.starters.real - a.fpts.starters.real).slice(0, 10),
                        overallMissedHighs: careerPlayerID.filter(p => p.playerInfo.pos == position && p.weeks.bench > 0).sort((a, b) => b.fpts.bench.real - a.fpts.bench.real).slice(0, 10),
                        weekOvers: playerMan.filter(p => p.playerInfo.pos == position && p.benched == false && p.projResult == true && p.nullifyProj == false).sort((a, b) => b.projDiff - a.projDiff).slice(0, 10),
                        weekUnders: playerMan.filter(p => p.playerInfo.pos == position && p.benched == false && p.projResult == false && p.nullifyProj == false).sort((a, b) => a.projDiff - b.projDiff).slice(0, 10),
                        seasonOvers: seasonPlayerID.filter(p => p.playerInfo.pos == position && p.weeks.starters > 0 && p.fpts.starters.diff > 0 && p.nullifyProj == false).sort((a, b) => b.fpts.starters.diff - a.fpts.starters.diff).slice(0, 10),
                        seasonUnders: seasonPlayerID.filter(p => p.playerInfo.pos == position && p.weeks.starters > 0 && p.fpts.starters.diff < 0 && p.nullifyProj == false).sort((a, b) => a.fpts.starters.diff - b.fpts.starters.diff).slice(0, 10),
                    }
                    for(const key in recordArrays.managers.alltime[recordPeriod][recordManID].positions[position]) {
                        if(recordArrays.managers.alltime[recordPeriod][recordManID].positions[position][key].length > 0) recordArrays.league.alltime[recordPeriod].positions[position].managerBests[key].push(recordArrays.managers.alltime[recordPeriod][recordManID].positions[position][key][0]);
                    }
                    recordArrays.league.alltime[recordPeriod].positions.leagueAverages[position].managerAverages.push({
                        recordManID,
                        manager: allManagers[recordManID],
                        real: career.fpts.pos[position].starters.real,
                        realPPG: career.fpts.pos[position].starters.realPPG,
                        proj: career.fpts.pos[position].starters.proj,
                        projPPG: career.fpts.pos[position].starters.projPPG,
                        perc: career.fpts.pos[position].starters.perc,
                    })
                    for(const key in recordArrays.league.alltime[recordPeriod].positions.leagueAverages[position]) {
                        if(key != 'managerAverages') recordArrays.league.alltime[recordPeriod].positions.leagueAverages[position][key] += career.fpts.pos[position].starters[key];
                    }
                } 
            }

            for(const transType of transTypes) {
                if(!recordArrays.league.alltime[recordPeriod].acquisitions.leagueAverages[transType]) {
                    recordArrays.league.alltime[recordPeriod].acquisitions.leagueAverages[transType] = {
                        real: 0,
                        proj: 0,
                        weeks: 0,
                        managerAverages: [],
                    }
                    recordArrays.league.alltime[recordPeriod].acquisitions[transType] = {
                        weekHighs: weekPlayer.filter(p => p.howAcquired == transType && p.benched == false).sort((a, b) => b.fpts - a.fpts).slice(0, 10),
                        periodHighs: seasonPlayer.filter(p => p.fpts.trans[transType] && p.fpts.trans[transType].starters.weeks > 0).sort((a, b) => b.fpts.trans[transType].starters.real - a.fpts.trans[transType].starters.real).slice(0, 10),
                        weekMissedHighs: weekPlayer.filter(p => p.howAcquired == transType && p.benched == true).sort((a, b) => b.fpts - a.fpts).slice(0, 10),
                        overallHighs: careerPlayer.filter(p => p.fpts.trans[transType] && p.fpts.trans[transType].starters.weeks > 0).sort((a, b) => b.fpts.trans[transType].starters.real - a.fpts.trans[transType].starters.real).slice(0, 10),
                        gamesHighs: careerPlayer.filter(p => p.fpts.trans[transType] && p.fpts.trans[transType].starters.weeks > 0).sort((a, b) => b.fpts.trans[transType].starters.weeks - a.fpts.trans[transType].starters.weeks).slice(0, 10),
                        overallMissedHighs: careerPlayer.filter(p => p.fpts.trans[transType] && p.fpts.trans[transType].bench.weeks > 0).sort((a, b) => b.fpts.trans[transType].bench.real - a.fpts.trans[transType].bench.real).slice(0, 10),
                        weekOvers: weekPlayer.filter(p => p.howAcquired == transType && p.benched == false && p.projResult == true && p.nullifyProj == false).sort((a, b) => b.projDiff - a.projDiff).slice(0, 10),
                        weekUnders: weekPlayer.filter(p => p.howAcquired == transType && p.benched == false && p.projResult == false && p.nullifyProj == false).sort((a, b) => a.projDiff - b.projDiff).slice(0, 10),
                        seasonOvers: seasonPlayer.filter(p => p.fpts.trans[transType] && p.fpts.trans[transType].starters.weeks > 0 && p.fpts.trans[transType].starters.diff > 0 && p.nullifyProj == false).sort((a, b) => b.fpts.trans[transType].starters.diff - a.fpts.trans[transType].starters.diff).slice(0, 10),
                        seasonUnders: seasonPlayer.filter(p => p.fpts.trans[transType] && p.fpts.trans[transType].starters.weeks > 0 && p.fpts.trans[transType].starters.diff < 0 && p.nullifyProj == false).sort((a, b) => a.fpts.trans[transType].starters.diff - b.fpts.trans[transType].starters.diff).slice(0, 10),
                        managerBests: {},
                    }
                    if(transType == 'waiver') {
                        recordArrays.league.alltime[recordPeriod].acquisitions[transType].bestPickups = seasonPlayer.filter(p => p.fpts.trans[transType] && p.fpts.trans[transType].starters.weeks > 0 && p.price[transType] > 0).sort((a, b) => b.fpts.trans[transType].starters.roi - a.fpts.trans[transType].starters.roi).slice(0, 10);
                        recordArrays.league.alltime[recordPeriod].acquisitions[transType].worstPickups = seasonPlayer.filter(p => p.fpts.trans[transType] && p.fpts.trans[transType].starters.weeks > 0 && p.price[transType] > 0).sort((a, b) => a.fpts.trans[transType].starters.roi - b.fpts.trans[transType].starters.roi).slice(0, 10);
                    } else if(transType == 'draft') {
                        recordArrays.league.alltime[recordPeriod].acquisitions[transType].bestDraftees = seasonPlayer.filter(p => p.fpts.trans[transType] && p.fpts.trans[transType].starters.weeks > 0).sort((a, b) => b.fpts.trans[transType].starters.roi - a.fpts.trans[transType].starters.roi).slice(0, 10);
                        recordArrays.league.alltime[recordPeriod].acquisitions[transType].worstDraftees = seasonPlayer.filter(p => p.fpts.trans[transType] && p.fpts.trans[transType].starters.weeks > 0).sort((a, b) => a.fpts.trans[transType].starters.roi - b.fpts.trans[transType].starters.roi).slice(0, 10);
                    }
                    for(const key in recordArrays.league.alltime[recordPeriod].acquisitions[transType]) {
                        if(key != 'managerBests') recordArrays.league.alltime[recordPeriod].acquisitions[transType].managerBests[key] = [];
                    }
                }
                if(playerMan.length > 0) {

                    recordArrays.managers.alltime[recordPeriod][recordManID].acquisitions[transType] = {
                        weekHighs: playerMan.filter(p => p.howAcquired == transType && p.benched == false).sort((a, b) => b.fpts - a.fpts).slice(0, 10),
                        weekMissedHighs: playerMan.filter(p => p.howAcquired == transType && p.benched == true).sort((a, b) => b.fpts - a.fpts).slice(0, 10),
                        periodHighs: seasonPlayerID.filter(p => p.fpts.trans[transType] && p.fpts.trans[transType].starters.weeks > 0).sort((a, b) => b.fpts.trans[transType].starters.real - a.fpts.trans[transType].starters.real).slice(0, 10),
                        gamesHighs: careerPlayerID.filter(p => p.fpts.trans[transType] && p.fpts.trans[transType].starters.weeks > 0).sort((a, b) => b.fpts.trans[transType].starters.weeks - a.fpts.trans[transType].starters.weeks).slice(0, 10),
                        overallHighs: careerPlayerID.filter(p => p.fpts.trans[transType] && p.fpts.trans[transType].starters.weeks > 0).sort((a, b) => b.fpts.trans[transType].starters.real - a.fpts.trans[transType].starters.real).slice(0, 10),
                        overallMissedHighs: careerPlayerID.filter(p => p.fpts.trans[transType] && p.fpts.trans[transType].bench.weeks > 0).sort((a, b) => b.fpts.trans[transType].bench.real - a.fpts.trans[transType].bench.real).slice(0, 10),
                        weekOvers: playerMan.filter(p => p.howAcquired == transType && p.benched == false && p.projResult == true && p.nullifyProj == false).sort((a, b) => b.projDiff - a.projDiff).slice(0, 10),
                        weekUnders: playerMan.filter(p => p.howAcquired == transType && p.benched == false && p.projResult == false && p.nullifyProj == false).sort((a, b) => a.projDiff - b.projDiff).slice(0, 10),
                        seasonOvers: seasonPlayerID.filter(p => p.fpts.trans[transType] && p.fpts.trans[transType].starters.weeks > 0 && p.fpts.trans[transType].starters.diff > 0 && p.nullifyProj == false).sort((a, b) => b.fpts.trans[transType].starters.diff - a.fpts.trans[transType].starters.diff).slice(0, 10),
                        seasonUnders: seasonPlayerID.filter(p => p.fpts.trans[transType] && p.fpts.trans[transType].starters.weeks > 0 && p.fpts.trans[transType].starters.diff < 0 && p.nullifyProj == false).sort((a, b) => a.fpts.trans[transType].starters.diff - b.fpts.trans[transType].starters.diff).slice(0, 10),
                    }	
                    if(transType == 'waiver') {
                        recordArrays.league.alltime[recordPeriod].acquisitions[transType].bestPickups = seasonPlayerID.filter(p => p.fpts.trans[transType] && p.fpts.trans[transType].starters.weeks > 0 && p.price[transType] > 0).sort((a, b) => b.fpts.trans[transType].starters.roi - a.fpts.trans[transType].starters.roi).slice(0, 10);
                        recordArrays.league.alltime[recordPeriod].acquisitions[transType].worstPickups = seasonPlayerID.filter(p => p.fpts.trans[transType] && p.fpts.trans[transType].starters.weeks > 0 && p.price[transType] > 0).sort((a, b) => a.fpts.trans[transType].starters.roi - b.fpts.trans[transType].starters.roi).slice(0, 10);
                    } else if(transType == 'draft') {
                        recordArrays.league.alltime[recordPeriod].acquisitions[transType].bestDraftees = seasonPlayerID.filter(p => p.fpts.trans[transType] && p.fpts.trans[transType].starters.weeks > 0).sort((a, b) => b.fpts.trans[transType].starters.roi - a.fpts.trans[transType].starters.roi).slice(0, 10);
                        recordArrays.league.alltime[recordPeriod].acquisitions[transType].worstDraftees = seasonPlayerID.filter(p => p.fpts.trans[transType] && p.fpts.trans[transType].starters.weeks > 0).sort((a, b) => a.fpts.trans[transType].starters.roi - b.fpts.trans[transType].starters.roi).slice(0, 10);
                    }
                    for(const key in recordArrays.managers.alltime[recordPeriod][recordManID].acquisitions[transType]) {
                        if(recordArrays.managers.alltime[recordPeriod][recordManID].acquisitions[transType][key].length > 0) recordArrays.league.alltime[recordPeriod].acquisitions[transType].managerBests[key].push(recordArrays.managers.alltime[recordPeriod][recordManID].acquisitions[transType][key][0]);
                    }
                    recordArrays.league.alltime[recordPeriod].acquisitions.leagueAverages[transType].managerAverages.push({
                        recordManID,
                        manager: allManagers[recordManID],
                        real: career.fpts.trans[transType].starters.real,
                        realPPG: career.fpts.trans[transType].starters.realPPG,
                        proj: career.fpts.trans[transType].starters.proj,
                        projPPG: career.fpts.trans[transType].starters.projPPG,
                        perc: career.fpts.trans[transType].starters.perc,
                    })
                    for(const key in recordArrays.league.alltime[recordPeriod].acquisitions.leagueAverages[transType]) {
                        if(key != 'managerAverages') recordArrays.league.alltime[recordPeriod].acquisitions.leagueAverages[transType][key] += career.fpts.trans[transType].starters[key];
                    }
                }
            }
        }

        for(const entry of recordArrays.league.alltime[recordPeriod].transactions.trade) {
            if(recordArrays.league.alltime[recordPeriod].transactions.waiver.find(w => w.recordManID == entry.recordManID)) {
                const waiver = recordArrays.league.alltime[recordPeriod].transactions.waiver.find(w => w.recordManID == entry.recordManID);
                const freeAgent = recordArrays.league.alltime[recordPeriod].transactions.freeAgent.find(w => w.recordManID == entry.recordManID);
                const moves = entry.trade + (waiver?.waiver || 0) + (freeAgent?.freeAgent || 0);
                recordArrays.league.alltime[recordPeriod].transactions.moves.push({
                    recordManID: entry.recordManID,
                    manager: waiver.manager,
                    moves,
                    trade: entry.trade,
                    waiver: waiver?.waiver || 0,
                    outbid: waiver?.outbid || 0,
                    freeAgent: freeAgent?.freeAgent || 0,
                    waiverPerc: waiver?.waiverPerc || 'N/A',
                })
            }
        }

        for(const position of rosterPositions.alltime) {
            recordArrays.league.alltime[recordPeriod].positions.leagueAverages[position].managerAverages.sort((a, b) => b.realPPG - a.realPPG);
            recordArrays.league.alltime[recordPeriod].positions.leagueAverages[position].realPPG = recordArrays.league.alltime[recordPeriod].positions.leagueAverages[position].weeks > 0 ? recordArrays.league.alltime[recordPeriod].positions.leagueAverages[position].real / recordArrays.league.alltime[recordPeriod].positions.leagueAverages[position].weeks : 0;
            recordArrays.league.alltime[recordPeriod].positions[position].managerBests.weekHighs.sort((a, b) => b.fpts - a.fpts);
            recordArrays.league.alltime[recordPeriod].positions[position].managerBests.weekMissedHighs.sort((a, b) => b.fpts - a.fpts);
            recordArrays.league.alltime[recordPeriod].positions[position].managerBests.gamesHighs.sort((a, b) => b.weeks.starters - a.weeks.starters);
            recordArrays.league.alltime[recordPeriod].positions[position].managerBests.periodHighs.sort((a, b) => b.fpts.starters.real - a.fpts.starters.real);
            recordArrays.league.alltime[recordPeriod].positions[position].managerBests.overallHighs.sort((a, b) => b.fpts.starters.real - a.fpts.starters.real);
            recordArrays.league.alltime[recordPeriod].positions[position].managerBests.overallMissedHighs.sort((a, b) => b.fpts.bench.real - a.fpts.bench.real);
            recordArrays.league.alltime[recordPeriod].positions[position].managerBests.weekOvers.sort((a, b) => b.projDiff - a.projDiff);
            recordArrays.league.alltime[recordPeriod].positions[position].managerBests.weekUnders.sort((a, b) => a.projDiff - b.projDiff);
            recordArrays.league.alltime[recordPeriod].positions[position].managerBests.seasonOvers.sort((a, b) => b.fpts.starters.diff - a.fpts.starters.diff);
            recordArrays.league.alltime[recordPeriod].positions[position].managerBests.seasonUnders.sort((a, b) => a.fpts.starters.diff - b.fpts.starters.diff);
        }
        for(const transType of transTypes) {
            recordArrays.league.alltime[recordPeriod].acquisitions.leagueAverages[transType].managerAverages.sort((a, b) => b.realPPG - a.realPPG);
            recordArrays.league.alltime[recordPeriod].acquisitions.leagueAverages[transType].realPPG = recordArrays.league.alltime[recordPeriod].acquisitions.leagueAverages[transType].real / recordArrays.league.alltime[recordPeriod].acquisitions.leagueAverages[transType].weeks;
            recordArrays.league.alltime[recordPeriod].acquisitions[transType].managerBests.weekHighs.sort((a, b) => b.fpts - a.fpts);
            recordArrays.league.alltime[recordPeriod].acquisitions[transType].managerBests.periodHighs.sort((a, b) => b.fpts.trans[transType].starters.real - a.fpts.trans[transType].starters.real);
            recordArrays.league.alltime[recordPeriod].acquisitions[transType].managerBests.overallHighs.sort((a, b) => b.fpts.trans[transType].starters.real - a.fpts.trans[transType].starters.real);
            recordArrays.league.alltime[recordPeriod].acquisitions[transType].managerBests.overallMissedHighs.sort((a, b) => b.fpts.trans[transType].bench.real - a.fpts.trans[transType].bench.real);
            recordArrays.league.alltime[recordPeriod].acquisitions[transType].managerBests.weekMissedHighs.sort((a, b) => b.fpts - a.fpts);
            recordArrays.league.alltime[recordPeriod].acquisitions[transType].managerBests.gamesHighs.sort((a, b) => b.fpts.trans[transType].starters.weeks - a.fpts.trans[transType].starters.weeks);
            recordArrays.league.alltime[recordPeriod].acquisitions[transType].managerBests.weekOvers.sort((a, b) => b.projDiff - a.projDiff);
            recordArrays.league.alltime[recordPeriod].acquisitions[transType].managerBests.weekUnders.sort((a, b) => a.projDiff - b.projDiff);
            recordArrays.league.alltime[recordPeriod].acquisitions[transType].managerBests.seasonOvers.sort((a, b) => b.fpts.trans[transType].starters.diff - a.fpts.trans[transType].starters.diff);
            recordArrays.league.alltime[recordPeriod].acquisitions[transType].managerBests.seasonUnders.sort((a, b) => a.fpts.trans[transType].starters.diff - b.fpts.trans[transType].starters.diff);
            if(transType == 'waiver') {
                recordArrays.league.alltime[recordPeriod].acquisitions[transType].managerBests.bestPickups.sort((a, b) => b.fpts.trans[transType].starters.roi - a.fpts.trans[transType].starters.roi);
                recordArrays.league.alltime[recordPeriod].acquisitions[transType].managerBests.worstPickups.sort((a, b) => a.fpts.trans[transType].starters.roi - b.fpts.trans[transType].starters.roi);
            } else if(transType == 'draft') {
                recordArrays.league.alltime[recordPeriod].acquisitions[transType].managerBests.bestDraftees.sort((a, b) => b.fpts.trans[transType].starters.roi - a.fpts.trans[transType].starters.roi);
                recordArrays.league.alltime[recordPeriod].acquisitions[transType].managerBests.worstDraftees.sort((a, b) => a.fpts.trans[transType].starters.roi - b.fpts.trans[transType].starters.roi);
            }
        }
        for(const key in recordArrays.league.alltime[recordPeriod].transactions) {
            recordArrays.league.alltime[recordPeriod].transactions[key].sort((a, b) => b[key] - a[key]);
        }
        recordArrays.league.alltime[recordPeriod].players.managerBests.gamesHighs.sort((a, b) => b.weeks.starters - a.weeks.starters);
        recordArrays.league.alltime[recordPeriod].players.managerBests.weekHighs.sort((a, b) => b.fpts - a.fpts);
        recordArrays.league.alltime[recordPeriod].players.managerBests.weekMissedHighs.sort((a, b) => b.fpts - a.fpts);
        recordArrays.league.alltime[recordPeriod].players.managerBests.periodHighs.sort((a, b) => b.fpts.starters.real - a.fpts.starters.real);
        recordArrays.league.alltime[recordPeriod].players.managerBests.overallHighs.sort((a, b) => b.fpts.starters.real - a.fpts.starters.real);
        recordArrays.league.alltime[recordPeriod].players.managerBests.overallMissedHighs.sort((a, b) => b.fpts.bench.real - a.fpts.bench.real);
        recordArrays.league.alltime[recordPeriod].players.managerBests.weekOvers.sort((a, b) => b.projDiff - a.projDiff);
        recordArrays.league.alltime[recordPeriod].players.managerBests.weekUnders.sort((a, b) => a.projDiff - b.projDiff);
        recordArrays.league.alltime[recordPeriod].players.managerBests.seasonOvers.sort((a, b) => b.fpts.starters.diff - a.fpts.starters.diff);
        recordArrays.league.alltime[recordPeriod].players.managerBests.seasonUnders.sort((a, b) => a.fpts.starters.diff - b.fpts.starters.diff);
        recordArrays.league.alltime[recordPeriod].managerBests.weekHighs.sort((a, b) => b.fpts.starters.real - a.fpts.starters.real);	
        recordArrays.league.alltime[recordPeriod].managerBests.weekLows.sort((a, b) => b.fpts.starters.real - a.fpts.starters.real);		
        recordArrays.league.alltime[recordPeriod].managerBests.periodHighs.sort((a, b) => b.fpts.starters.realPPG - a.fpts.starters.realPPG);
        recordArrays.league.alltime[recordPeriod].managerBests.periodLows.sort((a, b) => b.fpts.starters.realPPG - a.fpts.starters.realPPG);
        recordArrays.league.alltime[recordPeriod].managerBests.blowoutBests.sort((a, b) => b.matchDifferential - a.matchDifferential);
        recordArrays.league.alltime[recordPeriod].managerBests.blowoutWorsts.sort((a, b) => a.matchDifferential - b.matchDifferential);
        recordArrays.league.alltime[recordPeriod].managerBests.narrowBests.sort((a, b) => a.matchDifferential - b.matchDifferential);
        recordArrays.league.alltime[recordPeriod].managerBests.narrowWorsts.sort((a, b) => b.matchDifferential - a.matchDifferential);
    
    }
    
    const recordsData = {
        allManagers,
        currentYear,
        lastYear,
        headToHeadRecords,
        recordArrays,
        rosterPositions,
        playerBook: {
            careers: masterRecordBook.careers.players.combined,
            seasons: masterRecordBook.seasons.players.combined,
            weeks: masterRecordBook.weeks.players,
        },
        playerRanks: fantasyPositionRanks,
    }

    // update localStorage
	// localStorage.setItem("records", JSON.stringify(storedData));

    records.update(() => recordsData);

	return recordsData;
}