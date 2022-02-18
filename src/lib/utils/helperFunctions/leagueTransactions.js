import { get } from 'svelte/store';
import {transactionsStore} from '$lib/stores';
import {
	waitForAll,
	getLeagueUsers,
	getLeagueRosters,
	getNflState,
	leagueID,
	managers,
	getLeagueData } from '$lib/utils/helper';

export const getLeagueTransactions = async (preview, refresh = false) => {
	const transactionsStoreVal = get(transactionsStore);

	if(transactionsStoreVal.transactions) {
		return {
			transactions: checkPreview(preview, transactionsStoreVal.transactions),
			currentManagers: transactionsStoreVal.currentManagers,
			prevManagers: transactionsStoreVal.prevManagers,
			totals: transactionsStoreVal.totals,
			stale: false
		};
	}

	// if this isn't a refresh data call, check if there are already transactions stored in localStorage
	if(!refresh) {
		let localTransactions = await JSON.parse(localStorage.getItem("transactions"));
		// check if transactions have been saved to localStorage before
		if(localTransactions) {
			localTransactions.transactions = checkPreview(preview, localTransactions.transactions);
			localTransactions.stale = true;
			return localTransactions;
		}
	}


	// gather supporting info simultaneously
	const nflState = await getNflState().catch((err) => { console.error(err); });
	
	let week = 18;
	if(nflState.season_type == 'regular') {
		week = nflState.week;
	}

	const numberManagers = managers.length;
	const leagueManagers = {};
	for(const manager of managers) {

		if(!leagueManagers[manager.roster]) leagueManagers[manager.roster] = [];
		leagueManagers[manager.roster].push({
			managerID: manager.managerID,
			rosterID: manager.roster,
			name: manager.name,
			yearsactive: manager.yearsactive,
		});
	}

	const {transactionsData, prevManagers, currentManagers, currentSeason, waiverBudgets, playoffStarts} = await combThroughTransactions(week, leagueID, leagueManagers).catch((err) => { console.error(err); });

	const { transactions, totals } = digestTransactions(transactionsData, prevManagers, currentSeason, numberManagers, leagueManagers, waiverBudgets, playoffStarts);

	const transactionPackage = {
		transactions,
		currentManagers,
		prevManagers,
		totals
	};

	// update localStorage
	localStorage.setItem("transactions", JSON.stringify(transactionPackage));

	// update the store
	transactionsStore.update(() => transactionPackage);

	return {
		transactions: checkPreview(preview, transactions),
		currentManagers,
		prevManagers,
		totals,
		stale: false
	};
}

const checkPreview = (preview, passedTransactions) => {
	if(preview) {
		// If this is being used for a preview component, only grab 2 trades and waivers
		const previewToReturn = 3;

		const trades = [];
		const waivers = [];
		
		let i = 0;
		while((trades.length < previewToReturn || waivers.length < previewToReturn) && i < passedTransactions.length) {
			if(passedTransactions[i].type == "waiver" && waivers.length < previewToReturn) {
				waivers.push(passedTransactions[i]);
			} else if(passedTransactions[i].type == "trade" && trades.length < previewToReturn) {

				trades.push(passedTransactions[i]);
			}
			i++;
		}

		return {trades, waivers};
	}
	return passedTransactions;
}

const combThroughTransactions = async (week, currentLeagueID, leagueManagers) => {
	week = week > 0 ? week : 1;
	
	const leagueIDs = [];
	const prevManagers = {};
	let currentManagers = null;
	let currentSeason = null;
	const waiverBudgets = {};
	const playoffStarts = {};

	while(currentLeagueID && currentLeagueID != 0) {
		// gather supporting info simultaneously
		const [leagueData, rosterRes, users] = await waitForAll(
			getLeagueData(currentLeagueID),
			getLeagueRosters(currentLeagueID),
			getLeagueUsers(currentLeagueID),
		).catch((err) => { console.error(err); });

		leagueIDs.push(currentLeagueID);

		const rosters = rosterRes.rosters;
		const managers = {};
		const year = parseInt(leagueData.season);
		playoffStarts[year] = leagueData.settings.playoff_week_start;
	
		for(const roster of rosters) {
			const rosterID = roster.roster_id;
			const user = users[roster.owner_id]; 
			
			const recordManager = leagueManagers[rosterID].find(m => m.yearsactive.includes(year));
			const recordManID = recordManager.managerID;

			if(user) {
				managers[recordManID] = {
					avatar: user.avatar != null ? `https://sleepercdn.com/avatars/thumbs/${user.avatar}` : `https://sleepercdn.com/images/v2/icons/player_default.webp`,
					name: user.metadata.team_name ? user.metadata.team_name : user.display_name,
					realname: recordManager.name,
					rosterID: rosterID,
				}
			} else {
				managers[recordManID] = {
					avatar: `https://sleepercdn.com/images/v2/icons/player_default.webp`,
					name: 'Unknown Manager',
					realname: recordManager.name,
					rosterID: rosterID,
				}
			}
		}

		if(!currentManagers) currentManagers = managers;
		if(!currentSeason) currentSeason = leagueData.season;

		prevManagers[leagueData.season] = managers;

		waiverBudgets[leagueData.season] = {
			faab: leagueData.settings.waiver_type == 2 ? leagueData.settings.waiver_budget : null,
			managers: {},
		}
		for(const recordManID in managers) {
			const roster = rosters.find(r => r.roster_id == managers[recordManID].rosterID);
			waiverBudgets[leagueData.season].managers[managers[recordManID].rosterID] = {
				remainingFaab: leagueData.settings.waiver_type == 2 ? leagueData.settings.waiver_budget - roster.settings.waiver_budget_used : null,
				priority: roster.settings.waiver_position,
				recordManID,
			}
		}
		
		currentLeagueID = leagueData.previous_league_id;
	}

	const transactionPromises = [];

	for(const singleLeagueID of leagueIDs) {
		while(week > 0) {
			transactionPromises.push(fetch(`https://api.sleeper.app/v1/league/${singleLeagueID}/transactions/${week}`, {compress: true}));
			week--;
		}
		week = 18;
	}

	const transactionRess = await waitForAll(...transactionPromises).catch((err) => { console.error(err); });

	const transactionDataPromises = [];
	
	for(const transactionRes of transactionRess) {
		if (!transactionRes.ok) {
			throw new Error(transactionRes);
		}
		transactionDataPromises.push(transactionRes.json());
	}

	const transactionsDataJson = await waitForAll(...transactionDataPromises).catch((err) => { console.error(err); });

	let transactionsData = [];

	for(const transactionDataJson of transactionsDataJson) {
		transactionsData = transactionsData.concat(transactionDataJson);
	}

	return {transactionsData, prevManagers, currentManagers, currentSeason, waiverBudgets, playoffStarts};
}

const digestTransactions = (transactionsData, prevManagers, currentSeason, numberManagers, leagueManagers, waiverBudgets, playoffStarts) => {
	const transactions = [];
	const failedAdds = {};
	const totals = {
		allTime: {},
		seasons: {}
	};

	// trades can be out of order because they are aded to sleeper when the offer is sent
	// this sort puts everything in the correct order
	const transactionOrder = transactionsData.sort((a,b) => b.status_updated - a.status_updated);
	
	for(const transaction of transactionOrder) {
		const {digestedTransaction, season, success} = digestTransaction(transaction, prevManagers, currentSeason, leagueManagers, waiverBudgets)
		if(!success) continue;
	
		if(digestedTransaction.type == 'outbid') {
			if(transactions.find(t => t.moves[0][0].player == digestedTransaction.player && t.date == digestedTransaction.date)) {

				const transactionMatch = transactions.find(t => t.moves[0][0].player == digestedTransaction.player && t.date == digestedTransaction.date);
				if(!transactionMatch.failedAdds) transactionMatch.failedAdds = [];
				transactionMatch.failedAdds.push({
					recordManID: leagueManagers[digestedTransaction.adds[digestedTransaction.player]].find(m => m.yearsactive.includes(season)).managerID,
					bid: digestedTransaction.bid,
				})
			} else {
				if(failedAdds[digestedTransaction.player] && failedAdds[digestedTransaction.player][digestedTransaction.date] && failedAdds[digestedTransaction.player][digestedTransaction.date].find(f => f.bid == digestedTransaction.bid && f.recordManID == digestedTransaction.adds[digestedTransaction.player])) continue;
				if(!failedAdds[digestedTransaction.player]) failedAdds[digestedTransaction.player] = {};
				if(!failedAdds[digestedTransaction.player][digestedTransaction.date]) failedAdds[digestedTransaction.player][digestedTransaction.date] = [];
				failedAdds[digestedTransaction.player][digestedTransaction.date].push({
					recordManID: leagueManagers[digestedTransaction.adds[digestedTransaction.player]].find(m => m.yearsactive.includes(season)).managerID,
					bid: digestedTransaction.bid,
				});
			}
		}
		if(digestedTransaction.type != 'outbid') {
			if(failedAdds[digestedTransaction.moves[0][0].player] && failedAdds[digestedTransaction.moves[0][0].player][digestedTransaction.date]) {

				if(failedAdds[digestedTransaction.moves[0][0].player][digestedTransaction.date].find(f => f.bid == digestedTransaction.moves[0][0].bid && f.recordManID == digestedTransaction.recordManIDs[0])) {
					if(digestedTransaction.week < playoffStarts[season]) {
						totals.allTime[digestedTransaction.recordManIDs[0]].regular.outbid--;
						totals.seasons[season][digestedTransaction.recordManIDs[0]].regular.outbid--;
					} else {
						totals.allTime[digestedTransaction.recordManIDs[0]].playoffs.outbid--;
						totals.seasons[season][digestedTransaction.recordManIDs[0]].playoffs.outbid--;
					}
				} else {
					digestedTransaction.failedAdds = [];
					for(const failedAdd in failedAdds[digestedTransaction.moves[0][0].player][digestedTransaction.date]) {
						digestedTransaction.failedAdds.push({
							recordManID: failedAdds[digestedTransaction.moves[0][0].player][digestedTransaction.date][failedAdd].recordManID,
							bid: failedAdds[digestedTransaction.moves[0][0].player][digestedTransaction.date][failedAdd].bid,
						});
					}
				}
			}
			transactions.push(digestedTransaction);
		}

		for(const roster of digestedTransaction.rosters) {
			const recordManID = leagueManagers[roster].find(m => m.yearsactive.includes(season)).managerID;
			
			const type = digestedTransaction.type;
			const allTypes = ['trade', 'waiver', 'outbid', 'freeAgent'];
			// create alltime entry for manager
			if(!totals.allTime[recordManID]) {
				totals.allTime[recordManID] = {
					regular: {},
					playoffs: {},
					manager: prevManagers[season][recordManID],
					recordManID,
				};
				for(const tType of allTypes) {
					totals.allTime[recordManID].regular[tType] = 0;
					totals.allTime[recordManID].playoffs[tType] = 0;
				}
			}
			// create season entry for manager
			if(!totals.seasons[season]) totals.seasons[season] = {}
			if(!totals.seasons[season][recordManID]) {
				totals.seasons[season][recordManID] = {
					regular: {},
					playoffs: {},
					manager: prevManagers[season][recordManID],
					recordManID,
				};
				for(const tType of allTypes) {
					totals.seasons[season][recordManID].regular[tType] = 0;
					totals.seasons[season][recordManID].playoffs[tType] = 0;
				}
			}
			// add to alltime & season totals
			if(digestedTransaction.week < playoffStarts[season]) {
				totals.allTime[recordManID].regular[type]++;
				totals.seasons[season][recordManID].regular[type]++;
			} else {
				totals.allTime[recordManID].playoffs[type]++;
				totals.seasons[season][recordManID].playoffs[type]++;
			}
		}
	}

	return {transactions, totals};
}

const digestDate = (tStamp) => {
	var a = new Date(tStamp);
	var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	var year = a.getFullYear();
	var month = months[a.getMonth()];
	var date = a.getDate();
	var hour = a.getHours();
	var min = a.getMinutes();
	return month + ' ' + date + ' ' + year + ', ' + (hour % 12 == 0 ? 12 : hour % 12) + ':' + min + (hour / 12 >= 1 ? "PM" : "AM");
}

const digestTransaction = (transaction, prevManagers, currentSeason, leagueManagers, waiverBudgets) => {
	// don't include failed waiver claims EXCEPT for people who were outbid
	if(transaction.status == 'failed' && !transaction.metadata.notes.includes('claimed by another owner')) return {success: false};
	
	const date = digestDate(transaction.status_updated)
	const transYear = parseInt(date.split(',')[0].split(' ')[2]);
	const season = transYear > parseInt(currentSeason) ? parseInt(currentSeason) : transYear;

	if(transaction.status == 'failed') {
		let digestedTransaction = {
			player: Object.keys(transaction.adds)[0],
			adds: transaction.adds,
			date,
			week: transaction.leg,
			bid: transaction.settings?.waiver_bid,
			rosters: transaction.roster_ids,
			type: 'outbid',
		};
		return {digestedTransaction, season, success: true};
	}
	const handled = [];
	const transactionRosters = transaction.roster_ids;
	const bid = transaction.settings?.waiver_bid;

	const transactionManagers = [];
	for(const transactionRoster of transactionRosters) {
		const recordManID = leagueManagers[transactionRoster].find(m => m.yearsactive.includes(season)).managerID;
		transactionManagers.push(recordManID);
	}

	let digestedTransaction = {
		id: transaction.transaction_id,
		date,
		year: season,
		week: transaction.leg,
		type: transaction.type == 'trade' ? 'trade' : waiverBudgets[season].faab && !bid && bid != 0 ? 'freeAgent' : 'waiver',
		rosters: transactionRosters,
		recordManIDs: transactionManagers,
		moves: [],
	}
		
	if(season != currentSeason) {
		digestedTransaction.previousOwners = [];
		for(const roster of transactionRosters) {
			const recordManID = leagueManagers[roster].find(m => m.yearsactive.includes(season)).managerID;
			digestedTransaction.previousOwners.push(prevManagers[season][recordManID]);
		}
	}

	const adds = transaction.adds;
	const drops = transaction.drops;
	const draftPicks = transaction.draft_picks;

	for(let player in adds) {
		if(!player) continue;
		handled.push(player);
		digestedTransaction.moves.push(handleAdds(transactionRosters, adds, drops, player, bid, season, waiverBudgets));
	}

	for(let player in drops) {
		if(handled.indexOf(player) > -1) continue;

		let move = new Array(transactionRosters.length).fill(null);
		if(!player) continue;
		move[transactionRosters.indexOf(drops[player])] = {
			type: "Dropped",
			player
		}

		digestedTransaction.moves.push(move);
	}

	for(let pick of draftPicks) {

		let move = new Array(transactionRosters.length).fill(null);

		move[transactionRosters.indexOf(pick.previous_owner_id)] = {
			type: "trade",
			side: "origin",
			asset: 'pick',
			pick: {
				season: pick.season,
				round: pick.round,
				original_owner: null,
			},
			rosterID: pick.previous_owner_id,
		}

		if(pick.roster_id != pick.previous_owner_id) {
			const recordManID = leagueManagers[pick.roster_id].find(m => m.yearsactive.includes(season)).managerID;
			const original_owner = {
				original: season != currentSeason ? prevManagers[season][recordManID].name : null,
				current: pick.roster_id
			}
			move[transactionRosters.indexOf(pick.previous_owner_id)].pick.original_owner = original_owner;
		}

		move[transactionRosters.indexOf(pick.owner_id)] = {
			type: "trade",
			side: "destination",
			asset: 'pick',
			pick: {
				season: pick.season,
				round: pick.round,
				original_owner: null,
			},
			rosterID: pick.owner_id,
		}
		
		digestedTransaction.moves.push(move);
	}

	for(let wBudget of transaction.waiver_budget) {

		let move = new Array(transactionRosters.length).fill(null);

		move[transactionRosters.indexOf(wBudget.sender)] = {
			type: "trade",
			side: "origin",
			asset: 'faab',
			budget: {
				amount: `${wBudget.amount}$`,
			},
			rosterID: wBudget.sender,
		}

		move[transactionRosters.indexOf(wBudget.receiver)] = {
			type: "trade",
			side: "destination",
			asset: 'faab',
			budget: {
				amount: `${wBudget.amount}$`,
			},
			rosterID: wBudget.receiver,
		}
		
		digestedTransaction.moves.push(move);
	}

	return {digestedTransaction, season, success: true};
}

const handleAdds = (rosters, adds, drops, player, bid, season, waiverBudgets) => {
	let move = new Array(rosters.length).fill(null);
	if(drops && drops[player]) {
		move[rosters.indexOf(drops[player])] = {
			type: "trade",
			side: "origin",
			asset: 'player',
			player,
			rosterID: drops[player],
		}

		move[rosters.indexOf(adds[player])] =  {
			type: "trade",
			side: "destination",
			asset: 'player',
			player,
			rosterID: adds[player],
		}
		
		return move;
	}

	let budgetPercRemaining, budgetPercTotal;
	if(bid || bid == 0) {

		budgetPercTotal = bid / waiverBudgets[season].faab * 100;

		waiverBudgets[season].managers[adds[player]].remainingFaab += bid;
		budgetPercRemaining = waiverBudgets[season].managers[adds[player]].remainingFaab > 0 ? bid / waiverBudgets[season].managers[adds[player]].remainingFaab * 100 : 0;
	}

	move[rosters.indexOf(adds[player])] = {
		type: "Added",
		subType: waiverBudgets[season].faab && !bid && bid != 0 ? 'freeAgent' : 'waiver',
		asset: 'player',
		player,
		bid,
		budgetPercs: {
			remaining: budgetPercRemaining,
			total: budgetPercTotal,
		},
	}

	return move;
}