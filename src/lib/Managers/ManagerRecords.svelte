<script>
  	import DataTable, { Head, Body, Row, Cell } from '@smui/data-table'; 
    import Button, { Group, Label } from '@smui/button';
    import { Icon } from '@smui/tab';
    import { gotoManager, round } from '$lib/utils/helper';
    import LeagueMatchup from '$lib/Records/LeagueMatchup.svelte';


    export let recordManID, firstYear, currentYear, records;

    let showEmpty = false;
    let selection = 'regular'; 
    let displayPositionRecord = 'ALL';
    let displayAcquisition = 'ALL';
    let masterSelection = 'alltime';
    let masterPrefix = 'All-Time';
    let recordPrefix = 'Regular Season';
    let displayYear = currentYear;
    let emptyMessage, selectedMatchup, headToHeadRecords;

    let showTies = {
        headTable: {
            match: false,
            EPE: false,
            bballEPE: false,
            iq: false,
            iqEPE: false,
            bball: false,
        },          
        headViewer: {
            match: false,
            EPE: false,
            bballEPE: false,
            iq: false,
            iqEPE: false,
            bball: false,
        },
    }

    let positionsArray = [];
    let managerChoicesLeft = [];
    let managerChoicesRight = [];

    let displayRecords = {
        weekHighs: {
            stats: records.recordArrays.managers.alltime.regular[recordManID].weekHighs,
            sort: 'real',
            path: ['fpts', 'starters'],
            inverted: false,
        },
        weekLows: {
            stats: records.recordArrays.managers.alltime.regular[recordManID].weekLows,
            sort: 'real',
            path: ['fpts', 'starters'],
            inverted: false,
        },
        periodHighs: {
            stats: records.recordArrays.managers.alltime.regular[recordManID].periodHighs,
            sort: 'realPPG',
            path: ['fpts', 'starters'],
            inverted: false,
        },
        periodLows: {
            stats: records.recordArrays.managers.alltime.regular[recordManID].periodLows,
            sort: 'realPPG',
            path: ['fpts', 'starters'],
            inverted: false,
        },
        blowoutBests: {
            stats: records.recordArrays.managers.alltime.regular[recordManID].blowoutBests,
            sort: 'matchDifferential',
            path: [],
            inverted: false,
        },
        blowoutWorsts: {
            stats: records.recordArrays.managers.alltime.regular[recordManID].blowoutWorsts,
            sort: 'matchDifferential',
            path: [],
            inverted: false,
        },
        narrowBests: {
            stats: records.recordArrays.managers.alltime.regular[recordManID].narrowBests,
            sort: 'matchDifferential',
            path: [],
            inverted: false,
        },
        narrowWorsts: {
            stats: records.recordArrays.managers.alltime.regular[recordManID].narrowWorsts,
            sort: 'matchDifferential',
            path: [],
            inverted: false,
        },
        headToHeads: {
            stats: records.recordArrays.managers.alltime.regular[recordManID].headToHeads,
            sort: 'perc',
            path: ['outcomes', 'match'],
            inverted: false,
        },
        players: {
            periodHighs: {
                stats: records.recordArrays.managers.alltime.regular[recordManID].players.periodHighs,
                sort: 'real',
                path: ['fpts', 'starters'],
                inverted: false,
            },
            weekHighs: {
                stats: records.recordArrays.managers.alltime.regular[recordManID].players.weekHighs,
                sort: 'fpts',
                path: [],
                inverted: false,
            },
            weekMissedHighs: {
                stats: records.recordArrays.managers.alltime.regular[recordManID].players.weekMissedHighs,
                sort: 'fpts',
                path: [],
                inverted: false,
            },
            overallMissedHighs: {
                stats: records.recordArrays.managers.alltime.regular[recordManID].players.overallMissedHighs,
                sort: 'real',
                path: ['fpts', 'bench'],
                inverted: false,
            },
            overallHighs: {
                stats: records.recordArrays.managers.alltime.regular[recordManID].players.overallHighs,
                sort: 'real',
                path: ['fpts', 'starters'],
                inverted: false,
            },
            gamesHighs: {
                stats: records.recordArrays.managers.alltime.regular[recordManID].players.gamesHighs,
                sort: 'starters',
                path: ['weeks'],
                inverted: false,
            },
            weekOvers: {
                stats: records.recordArrays.managers.alltime.regular[recordManID].players.weekOvers,
                sort: 'projDiff',
                path: [],
                inverted: false,
            },
            weekUnders: {
                stats: records.recordArrays.managers.alltime.regular[recordManID].players.weekUnders,
                sort: 'projDiff',
                path: [],
                inverted: true,
            },
            seasonOvers: {
                stats: records.recordArrays.managers.alltime.regular[recordManID].players.seasonOvers,
                sort: 'diff',
                path: ['fpts', 'starters'],
                inverted: false,
            },
            seasonUnders: {
                stats: records.recordArrays.managers.alltime.regular[recordManID].players.seasonUnders,
                sort: 'diff',
                path: ['fpts', 'starters'],
                inverted: true,
            },
        },
        positions: {},
        acquisitions: {},
    }
    for(const position in records.recordArrays.managers.alltime.regular[recordManID].positions) {
        displayRecords.positions[position] = {
            periodHighs: {
                stats: records.recordArrays.managers.alltime.regular[recordManID].positions[position].periodHighs,
                sort: 'real',
                path: ['fpts', 'starters'],
                inverted: false,
            },
            weekHighs: {
                stats: records.recordArrays.managers.alltime.regular[recordManID].positions[position].weekHighs,
                sort: 'fpts',
                path: [],
                inverted: false,
            },
            weekMissedHighs: {
                stats: records.recordArrays.managers.alltime.regular[recordManID].positions[position].weekMissedHighs,
                sort: 'fpts',
                path: [],
                inverted: false,
            },
            overallMissedHighs: {
                stats: records.recordArrays.managers.alltime.regular[recordManID].positions[position].overallMissedHighs,
                sort: 'real',
                path: ['fpts', 'bench'],
                inverted: false,
            },
            gamesHighs: {
                stats: records.recordArrays.managers.alltime.regular[recordManID].positions[position].gamesHighs,
                sort: 'starters',
                path: ['weeks'],
                inverted: false,
            },
            overallHighs: {
                stats: records.recordArrays.managers.alltime.regular[recordManID].positions[position].overallHighs,
                sort: 'real',
                path: ['fpts', 'starters'],
                inverted: false,
            },
            weekOvers: {
                stats: records.recordArrays.managers.alltime.regular[recordManID].positions[position].weekOvers,
                sort: 'projDiff',
                path: [],
                inverted: false,
            },
            weekUnders: {
                stats: records.recordArrays.managers.alltime.regular[recordManID].positions[position].weekUnders,
                sort: 'projDiff',
                path: [],
                inverted: true,
            },
            seasonOvers: {
                stats: records.recordArrays.managers.alltime.regular[recordManID].positions[position].seasonOvers,
                sort: 'diff',
                path: ['fpts', 'starters'],
                inverted: false,
            },
            seasonUnders: {
                stats: records.recordArrays.managers.alltime.regular[recordManID].positions[position].seasonUnders,
                sort: 'diff',
                path: ['fpts', 'starters'],
                inverted: true,
            },
        }
    }
    for(const transType in records.recordArrays.managers.alltime.regular[recordManID].acquisitions) {
        displayRecords.acquisitions[transType] = {
            periodHighs: {
                stats: records.recordArrays.managers.alltime.regular[recordManID].acquisitions[transType].periodHighs,
                sort: 'real',
                path: ['fpts', 'starters'],
                inverted: false,
            },
            weekHighs: {
                stats: records.recordArrays.managers.alltime.regular[recordManID].acquisitions[transType].weekHighs,
                sort: 'fpts',
                path: [],
                inverted: false,
            },
            weekMissedHighs: {
                stats: records.recordArrays.managers.alltime.regular[recordManID].acquisitions[transType].weekMissedHighs,
                sort: 'fpts',
                path: [],
                inverted: false,
            },
            overallMissedHighs: {
                stats: records.recordArrays.managers.alltime.regular[recordManID].acquisitions[transType].overallMissedHighs,
                sort: 'real',
                path: ['fpts', 'bench'],
                inverted: false,
            },
            gamesHighs: {
                stats: records.recordArrays.managers.alltime.regular[recordManID].acquisitions[transType].gamesHighs,
                sort: 'starters',
                path: ['weeks'],
                inverted: false,
            },
            overallHighs: {
                stats: records.recordArrays.managers.alltime.regular[recordManID].acquisitions[transType].overallHighs,
                sort: 'real',
                path: ['fpts', 'starters'],
                inverted: false,
            },
            weekOvers: {
                stats: records.recordArrays.managers.alltime.regular[recordManID].acquisitions[transType].weekOvers,
                sort: 'projDiff',
                path: [],
                inverted: false,
            },
            weekUnders: {
                stats: records.recordArrays.managers.alltime.regular[recordManID].acquisitions[transType].weekUnders,
                sort: 'projDiff',
                path: [],
                inverted: true,
            },
            seasonOvers: {
                stats: records.recordArrays.managers.alltime.regular[recordManID].acquisitions[transType].seasonOvers,
                sort: 'diff',
                path: ['fpts', 'starters'],
                inverted: false,
            },
            seasonUnders: {
                stats: records.recordArrays.managers.alltime.regular[recordManID].acquisitions[transType].seasonUnders,
                sort: 'diff',
                path: ['fpts', 'starters'],
                inverted: true,
            },
        }
    }

    const refreshTables = (newPeriod, newMaster, newYear, newPosition, newAcquisition) => {

        displayManagerLeft = {
            info: records.allManagers[recordManID],
            recordManID,
        }
        managerChoicesLeft = [];
        managerChoicesLeft.push(displayManagerLeft);

        for(const key in displayRecords) {
            if(newMaster == 'yearly' && (key == 'periodHighs' || key == 'periodLows')) continue;
            if(displayRecords[key].stats) {
                displayRecords[key].stats = newMaster == 'yearly' ? records.recordArrays.managers.years[newYear][newPeriod][recordManID][key] : records.recordArrays.managers.alltime[newPeriod][recordManID][key];
            } else {
                for(const key2 in displayRecords[key]) {
                    if(displayRecords[key][key2].stats) {
                        if((newPosition != 'ALL' || newAcquisition != 'ALL') && key == 'players') {
                            if(newPosition != 'ALL') {
                                displayRecords[key][key2].stats = newMaster == 'yearly' ? records.recordArrays.managers.years[newYear][newPeriod][recordManID].positions[newPosition][key2] : records.recordArrays.managers.alltime[newPeriod][recordManID].positions[newPosition][key2];
                            } else if(newAcquisition != 'ALL') {
                                displayRecords[key][key2].stats = newMaster == 'yearly' ? records.recordArrays.managers.years[newYear][newPeriod][recordManID].acquisitions[newAcquisition][key2] : records.recordArrays.managers.alltime[newPeriod][recordManID].acquisitions[newAcquisition][key2];
                            } 
                        } else {
                            displayRecords[key][key2].stats = newMaster == 'yearly' ? records.recordArrays.managers.years[newYear][newPeriod][recordManID][key][key2] : records.recordArrays.managers.alltime[newPeriod][recordManID][key][key2];
                        }
                    } else {
                        for(const key3 in displayRecords[key][key2]) {
                            if(displayRecords[key][key2][key3].stats) {
                                displayRecords[key][key2][key3].stats = newMaster == 'yearly' ? records.recordArrays.managers.years[newYear][newPeriod][recordManID][key][key2][key3] : records.recordArrays.managers.alltime[newPeriod][recordManID][key][key2][key3];
                            } else {
                                for(const key4 in displayRecords[key][key2][key3]) {
                                    if(key3 == 'leagueAverages') {
                                        displayRecords[key][key2][key3][key4].stats = newMaster == 'yearly' ? records.recordArrays.managers.years[newYear][newPeriod][recordManID][key][key3][key2][key4] : records.recordArrays.managers.alltime[newPeriod][recordManID][key][key3][key2][key4];

                                    } else {
                                        displayRecords[key][key2][key3][key4].stats = newMaster == 'yearly' ? records.recordArrays.managers.years[newYear][newPeriod][recordManID][key][key2][key3][key4] : records.recordArrays.managers.alltime[newPeriod][recordManID][key][key2][key3][key4];
                                    }
                                }
                            }
                        }
                    }
                } 
            }
        }
        
        headToHeadRecords = newMaster == 'yearly' ? records.headToHeadRecords[newPeriod].years[newYear] : records.headToHeadRecords[newPeriod].alltime;
        positionsArray = newMaster == 'yearly' ? records.rosterPositions.years[newYear] : records.rosterPositions.alltime;
        showTies.headTable.EPE = displayRecords.headToHeads.stats.find(r => r.outcomes.EPE.T > 0) ? true : false;
        showTies.headTable.match = displayRecords.headToHeads.stats.find(r => r.outcomes.match.T > 0) ? true : false;
        showTies.headTable.iq = displayRecords.headToHeads.stats.find(r => r.outcomes.iq.T > 0) ? true : false;
        showTies.headTable.iqEPE = displayRecords.headToHeads.stats.find(r => r.outcomes.iqEPE.T > 0) ? true : false;
        showTies.headTable.bball = displayRecords.headToHeads.stats.find(r => r.outcomes.bball.T > 0) ? true : false;
        showTies.headTable.bballEPE = displayRecords.headToHeads.stats.find(r => r.outcomes.bballEPE.T > 0) ? true : false;
    }
    $: refreshTables(selection, masterSelection, displayYear, displayPositionRecord, displayAcquisition);


    let allMatchups = [];
    let displayManagerRight = {};
    let displayManagerLeft = {};

    const changeManager = (newManagerRight, headToHeadRecords) => {

        if(newManagerRight) {

            displayManagerRight = {
                info: headToHeadRecords[recordManID][newManagerRight].oppManager,
                recordManID: newManagerRight,
            }
            for(const key in headToHeadRecords[recordManID][newManagerRight]) {
                if(key != 'oppRecordManID' && key != 'oppManager') {
                    displayManagerLeft[key] = headToHeadRecords[recordManID][newManagerRight][key];
                    displayManagerRight[key] = headToHeadRecords[newManagerRight][recordManID][key];
                } 
            }
            showTies.headViewer.match = displayManagerLeft.outcomes.match.T > 0 ? true : false;
            showTies.headViewer.EPE = displayManagerLeft.outcomes.EPE.T > 0 ? true : false;
            showTies.headViewer.iqEPE = displayManagerLeft.outcomes.iqEPE.T > 0 ? true : false;
            showTies.headViewer.iq = displayManagerLeft.outcomes.iq.T > 0 ? true : false;
            showTies.headViewer.bball = displayManagerLeft.outcomes.bball.T > 0 ? true : false;
            showTies.headViewer.bballEPE = displayManagerLeft.outcomes.bballEPE.T > 0 ? true : false;

            selectedMatchup = 0;
            allMatchups = [];
            for(const matchup in displayManagerLeft.matchups) {
                allMatchups.push({
                    home: displayManagerLeft.matchups[matchup],
                    away: displayManagerRight.matchups[matchup],
                })
            }
            displayMatchup = {
                home: displayManagerLeft.matchups[selectedMatchup],
                away: displayManagerRight.matchups[selectedMatchup],
            }
        }
    }
 
    const getHead = (headToHeadRecords) => {
        managerChoicesRight = [];
        for(const manager in headToHeadRecords) {
            if(manager != recordManID && headToHeadRecords[manager][recordManID].outcomes.match.W + headToHeadRecords[manager][recordManID].outcomes.match.T + headToHeadRecords[manager][recordManID].outcomes.match.L > 0) {
                managerChoicesRight.push({
                    info: headToHeadRecords[recordManID][manager].oppManager,
                    recordManID: manager,
                });
                if(!displayManagerRight.recordManID) {
                    displayManagerRight = {
                        info: headToHeadRecords[recordManID][manager].oppManager,
                        recordManID: manager,
                    }
                }
            }
        }
        changeManager(displayManagerRight.recordManID, headToHeadRecords);

        return managerChoicesRight;
    }
    $: getHead(headToHeadRecords);

    managerChoicesRight = getHead(headToHeadRecords);

    let displayMatchup;
    let displayWeekRecord = 'best';
    let displaySeasonRecord = 'best';
    let displayBlowoutRecord = 'won';
    let displayNailbiterRecord = 'won';
    let displayPlayerRecord = 'overall';

    const toggles = (newMatchup = null, newPeriod = null, newMaster = null, newYear = null) => {
        if(newMatchup && displayManagerLeft && displayManagerRight) {
            displayMatchup = {
                home: displayManagerLeft.matchups[newMatchup],
                away: displayManagerRight.matchups[newMatchup],
            }
        }
        if(newPeriod || newMaster) {
            masterPrefix = newMaster == 'alltime' ? 'All-Time' : newYear;

            if(newPeriod == 'regular') {
                recordPrefix = "Regular Season";
                showEmpty = false;
            } else if(newPeriod == 'playoffs') {
                recordPrefix = "Playoffs";
                if((newMaster == 'yearly' && !records.recordArrays.managers.years[newYear][newPeriod][recordManID]) || (newMaster == 'alltime' && !records.recordArrays.managers.alltime[newPeriod][recordManID])) {
                    showEmpty = true;
                    emptyMessage = displayType == 'yearly' ? `No Playoff Records for ${newYear}...` : 'No Playoff Records Yet...';
                }
            } else if(newPeriod == 'combined') {
                recordPrefix = "Combined";
                showEmpty = false;
            }
        }
    }
    $: toggles(selectedMatchup, selection, masterSelection, displayYear);

    let rand = 1;
    const changeSort = (path, newRecordArray, newKey, newPath = null, inverted = false, newAltPath = null) => {
        let applyPath = newAltPath && displayType == 'yearly' ? newAltPath : newPath ? newPath : null;
        if(path.sort == newKey) {
            if(path.inverted == false) {
                newRecordArray.sort((a, b) => a[newKey] - b[newKey]);
                path.inverted = true;
                curSort.inverted = true;
            } else {
                newRecordArray.sort((a, b) => b[newKey] - a[newKey]);
                path.inverted = false;
                curSort.inverted = false;
            }
        } else {
            if(applyPath) {
                for(let i = 0; i < applyPath.length; i++) {
                    newRecordArray = newRecordArray[applyPath[i]];
                }
                path.path = applyPath;
            }
            if(inverted == false) {
                newRecordArray.sort((a, b) => b[newKey] - a[newKey]);
            } else {
                newRecordArray.sort((a, b) => a[newKey] - b[newKey]);
            }
            path.sort = newKey;
        } 
        rand = rand * Math.random();
    }

</script>

<!-- svelte-ignore non-top-level-reactive-declaration -->
<style>

    :global(.header) {
        text-align: center;
    }

    :global(.recordTable) {
        box-shadow: 0px 3px 3px -2px var(--boxShadowOne), 0px 3px 4px 0px var(--boxShadowTwo), 0px 1px 8px 0px var(--boxShadowThree);
        margin: 2em;
    }

    :global(.playerTable) {
        box-shadow: 0px 3px 3px -2px var(--boxShadowOne), 0px 3px 4px 0px var(--boxShadowTwo), 0px 1px 8px 0px var(--boxShadowThree);
        margin: 2em;
        background-color: var(--gcComponent);
    }

    :global(.playerTable th) {
        background-color: var(--gcMain);
        text-align: center;
        color: var(--gcBannerText);
    }

    :global(.playerTable td) {
        background-color: var(--gcSelect);
        color: var(--gcPlayRowText);
        font-weight: 400;
    }

    :global(.playerTable thead tr) {
        background-color: var(--gcMain);
    }

    :global(.playerTable tbody tr) {
        background-color: var(--gcSelect);
    }

    :global(.playerTable table) {
        background-color: var(--gcBox);
    }

    .playerAvatar {
		vertical-align: middle;
		height: 45px;
		width: 45px;
		background-position: center;
		background-repeat: no-repeat;
		background-size: auto 45px;
	}

    .playerInfo {
        display: inline-block;
        /* display: flex; */
        padding: 0 0 0 20px;
    }

    .showEmpty {
        text-align: center;
    }

    .fantasyTeamName {
        font-style: italic;
        color: #999;
        font-size: 0.8em;
        line-height: 1.1em;
        width: 100%;
    }

    .buttonHolder {
        text-align: center;
        margin: 2em 0;
        width: 100%;
    }

    :global(.cellName) {
        cursor: pointer;
        line-height: 1.2em;
    }

    .yearText {
        flex-grow: 1;
        text-align: center;
        font-size: 2.25em;
        font-weight: 220;
    }

    .center {
        text-align: center;
    }

    :global(.changeYear) {
        position: relative;
        display: inline-flex;
        width: 20%;
        z-index: 1;
        font-size: 2.25em;
        cursor: pointer;
        color: #888;
        justify-content: center;
    }

    :global(.changeYear:hover) {
        color: #00316b;
    }

    .spacer {
        width: 20%;
        position: relative;
        display: inline-flex;
        margin: 0 2.5%;
    }

    .pos {
        display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 7px;
        max-width: 28px;
        min-width: 28px;
		height: 28px;
    }
    .QB {
		background-color: var(--QB);
	}

	.WR {
		background-color: var(--WR);
	}

	.RB {
		background-color: var(--RB);
	}

	.TE {
		background-color: var(--TE);
	}

	.K {
		background-color: var(--K);
	}

	.DEF {
		background-color: var(--DEF);
	}

    .DL, .DE, .DT {
        background-color: var(--DL);
    }

    .LB {
        background-color: var(--LB);
    }

    .DB, .CB, .SS, .FS {
        background-color: var(--DB);
    }

        /* Start button resizing */

    @media (max-width: 540px) {
        :global(.buttonHolder .selectionButtons) {
            font-size: 0.6em;
        }
    }

    @media (max-width: 415px) {
        :global(.buttonHolder .selectionButtons) {
            font-size: 0.5em;
            padding: 0 6px;
        }
    }

    @media (max-width: 315px) {
        :global(.buttonHolder .selectionButtons) {
            font-size: 0.45em;
            padding: 0 3px;
        }
    }

    /* End button resizing */

    /* Start record table resizing */

    @media (max-width: 510px) {
        :global(.recordTable th) {
            font-size: 0.8em;
            padding: 1px 5px;
        }
        :global(.recordTable td) {
            font-size: 0.8em;
            padding: 1px 12px;
        }
        :global(.playerTable th) {
            font-size: 0.8em;
            padding: 1px 5px;
        }
        :global(.playerTable td) {
            font-size: 0.8em;
            padding: 1px 12px;
        }
    }

    @media (max-width: 435px) {
        :global(.rank) {
            padding: 1px 0 1px 5px !important;
        }
        :global(.rank) {
            padding: 1px 0 1px 5px !important;
        }
    }

    @media (max-width: 420px) {
        :global(.recordTable th) {
            font-size: 0.6em;
            padding: 1px 5px;
        }
        :global(.recordTable td) {
            font-size: 0.6em;
            padding: 1px 12px;
        }
        :global(.playerTable th) {
            font-size: 0.6em;
            padding: 1px 5px;
        }
        :global(.playerTable td) {
            font-size: 0.6em;
            padding: 1px 12px;
        }
    }

    @media (max-width: 330px) {
        :global(.recordTable th) {
            font-size: 0.5em;
            padding: 1px 5px;
        }
        :global(.recordTable td) {
            font-size: 0.5em;
            padding: 1px 8px;
        }
        :global(.playerTable th) {
            font-size: 0.5em;
            padding: 1px 5px;
        }
        :global(.playerTable td) {
            font-size: 0.5em;
            padding: 1px 8px;
        }
    }

    /* END record table resizing */

    .headerRow {
        position: relative;
        display: inline-flex;
        height: 2em;
        width: 100%;
        margin: 1em 0;
        align-items: center;
        justify-content: space-around;
    }

    .headerLabel {
        position: relative;
        display: inline-flex;
        color: var(--gcPlayRowText);
        font-weight: 420;
        font-size: 2em;
        justify-content: center;
    }

    .recordsWrap {
        position: relative;
        display: inline-flex;
        flex-direction: row;
        width: 100%;
        justify-content: center;
    }

    .columnWrap {
        position: relative;
        display: inline-flex;
        flex-direction: column;
        width: 48%;
        padding: 1%;
        align-items: center;
    }

    .mainBase {
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        height: 100%;
        position: relative;
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        align-content: center;
        background-color: var(--gcComponent);
        border-radius: 50px;
    }

    .rankingsWrapper {
        width: 100%;
        margin: 5% auto;
        height: 100%;
        position: relative;
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        align-content: center;
    }

    .headingContainer {
        display: inline-flex;
        position: relative;
        width: 100%;
        height: 7em;
        background-color: var(--gcBox);
        align-items: center;
        justify-content: center;
        box-shadow: inset 0px 3px 3px -2px rgb(0 0 0 / 40%), inset 0px 3px 4px 0px rgb(0 0 0 / 28%), inset 0px 1px 8px 0px rgb(0 0 0 / 24%);
    }

    .headingText {
        position: relative;
        display: inline-flex;
        justify-content: center;
        text-align: center;
        font-size: 2.25em;
        font-weight: 450;
        color: var(--gcPlayRowText);
    }

    .headToHeadWrap {
        position: relative;
        display: inline-flex;
        flex-direction: row;
        justify-content: center;
        width: 79.5%;
        height: 50em;
        background-color: var(--gcBox);
        padding: 0.25%;
    }

    .headToHeadChoices {
        position: relative;
        display: inline-flex;
        flex-direction: column;
        width: 19.5%;
        margin: 0.25%;
        background-color: var(--gcComponent);
        justify-content: space-evenly;
    }

    .headToHeadMain {
        position: relative;
        display: inline-flex;
        width: 100%;
        height: 28%;
        background-color: var(--gcComponent);
    }

    .headToHeadRow {
        position: relative;
        display: inline-flex;
        color: var(--gcPlayRowText);
        width: 92%;
        padding: 0 4%;
        height: 2.5em;
        flex-direction: column;
        align-items: flex-start;
    }

    .headToHeadRow:hover {
        cursor: pointer;
        background-color: var(--gcSelect);
        border: 0.1em solid var(--g111);
        height: 2.3em;
        width: 90%;
    }

    .managerAvatar {
        display: inline-flex;
        flex-direction: row;
        position: relative;
        border: 0.25px solid #777; 
        border-radius: 50%; 
        height: 90%; 
        width: auto;
        margin: 0 2%;
    }

    .managerName {
        display: inline-flex;
        position: relative;
        flex-direction: column;
        justify-content: center;
    }

    .managerProfile {
        display: inline-flex;
        position: relative;
        height: 40%;
        width: 100%;
        align-items: center;
        justify-content: center;
    }

    .headToHeadSummaryWrap {
        display: inline-flex;
        position: relative;
        height: 60%;
        width: 100%;
    }

    .headToHeadSummaryText {
        display: inline-flex;
        position: relative;
        width: 100%;
        font-size: 0.85em;
        line-height: 1em;
        justify-content: flex-start;
    }

    .headToHeadSummaryHeader {
        display: inline-flex;
        position: relative;
        width: 100%;
        justify-content: center;
    }

    .matchupHolder {
        display: inline-flex;
        position: relative;
        background-color: var(--gcComponent);
        width: 100%;
        height: 100%;
        flex-wrap: nowrap;
		transition: margin-left 0.8s;
    }

    .matchupWrap {
        display: block;
        width: 100%;
        height: 68%;
        overflow-x: hidden;
    }

    .matchupSwitcher {
        display: inline-flex;
        position: relative;
        background-color: var(--gcComponent);
        width: 100%;
        height: 5%;
        padding: 1% 0;
        border-top: 0.1em dashed var(--gcBox);
        align-items: center;
        justify-content: space-between;
        color: var(--gcPlayRowText);
        font-size: 1.4em;
    }

    .headToHeadHeadingText {
        display: inline-flex;
        position: relative;
        font-size: 1em;
        font-weight: 450;
        width: 50%;
        color: var(--gcPlayRowText);
        justify-content: center;
    }

    :global(.changeMatchup) {
        display: inline-flex;
        position: relative;
        justify-content: center;
        font-size: 2.5em;
        cursor: pointer;
        color: #888;
        width: 25%;
    }

    :global(.changeMatchup:hover) {
        color: #00316b;
    }

    .headToHeadSpacer {
        width: 25%;
    }

    .matchup {
        position: relative;
        display: inline-flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        border-radius: 1em;
        background-color: var(--gcComponent);
        align-self: center;
        /* box-shadow: inset 0px 3px 3px -2px rgb(0 0 0 / 30%), inset 0px 3px 4px 0px rgb(0 0 0 / 28%), inset 0px 1px 4px 3px var(--gcScoreShadow); */
    }

    :global(.changeSort) {
        position: absolute;
        margin: 2px 0 0 7px;
        font-size: 1.05em;
        cursor: pointer;
    }

    .teamAvatar {
        display: inline-flex;
		align-items: center;
		justify-content: center;
        height: 35px;
        max-height: 35px;
    }

</style>

<div class="rankingsWrapper">
    <div class="mainBase">
        <div class="buttonHolder">
            <Group variant="outlined">
                <Button class="selectionButtons" on:click={() => masterSelection = 'alltime'} variant="{masterSelection == 'alltime' ? "raised" : "outlined"}">
                    <Label>All-Time</Label>
                </Button>
                <Button class="selectionButtons" on:click={() => masterSelection = 'yearly'} variant="{masterSelection == 'yearly' ? "raised" : "outlined"}">
                    <Label>Yearly</Label>
                </Button>
            </Group>
        </div>
        <div class="headingContainer">
            {#if masterSelection == 'yearly' && displayYear > firstYear}
                <Icon class="material-icons changeYear" on:click={() => displayYear = displayYear - 1}>chevron_left</Icon>
            {:else}
                <span class="spacer" />
            {/if}  
            <div class="headingText" style="width: 60%;">{masterPrefix} Records</div>
            {#if masterSelection == 'yearly' && displayYear < currentYear}
                <Icon class="material-icons changeYear" on:click={() => displayYear = displayYear + 1}>chevron_right</Icon>
            {:else}
                <span class="spacer" />
            {/if}  
        </div>
        <div class="buttonHolder">
            <Group variant="outlined">
                <Button class="selectionButtons" on:click={() => selection = 'regular'} variant="{selection == 'regular' ? "raised" : "outlined"}">
                    <Label>Regular Season</Label>
                </Button>
                <Button class="selectionButtons" on:click={() => selection = 'playoffs'} variant="{selection == 'playoffs' ? "raised" : "outlined"}">
                    <Label>Playoffs</Label>
                </Button>
                <Button class="selectionButtons" on:click={() => selection = 'combined'} variant="{selection == 'combined' ? "raised" : "outlined"}">
                    <Label>Combined</Label>
                </Button>
            </Group>
        </div>
        <div class="headerRow">
            {#if masterSelection == 'alltime'}
                <div class="headerLabel">Weeks</div>
                <div class="headerLabel">Seasons</div>
            {:else}
                <div class="headerLabel" style="justify-content: center">Weeks</div>
            {/if}
        </div>
        <div class="recordsWrap">
            <div class="columnWrap" style="{masterSelection == 'yearly' ? "width: 98%;" : null}">
                <div class="buttonHolder">
                    <Group variant="outlined">
                        <Button class="selectionButtons" on:click={() => displayWeekRecord = 'best'} variant="{displayWeekRecord == 'best' ? "raised" : "outlined"}">
                            <Label>Best</Label>
                        </Button>
                        <Button class="selectionButtons" on:click={() => displayWeekRecord = 'worst'} variant="{displayWeekRecord == 'worst' ? "raised" : "outlined"}">
                            <Label>Worst</Label>
                        </Button>
                    </Group>
                </div>
                {#if !showEmpty}
                    {#if displayWeekRecord == 'best'}
                        {#if displayRecords.weekHighs.stats && displayRecords.weekHighs.stats.length}
                            <DataTable class="playerTable" style="width: 450px;">
                                <Head>
                                    <Row>
                                        <Cell class="header" colspan=4>
                                            <p>
                                                Personal Best Week Scores<br>
                                                {masterPrefix} - {recordPrefix} 
                                            </p>
                                        </Cell>  
                                    </Row>
                                    <Row>
                                        <Cell class="header"></Cell>
                                        {#if masterSelection == 'alltime'}
                                            <Cell class="header">Year</Cell>
                                        {/if}
                                        <Cell class="header">Week</Cell>
                                        <Cell class="header">PF</Cell>
                                    </Row>
                                </Head>
                                <Body>
                                    {#each displayRecords.weekHighs.stats as weekBest, ix}
                                        <Row>
                                            <Cell>{ix + 1}</Cell>
                                            {#if masterSelection == 'alltime'}				
                                                <Cell class="center">{weekBest.year}</Cell>
                                            {/if}
                                            <Cell class="center">{weekBest.week}</Cell>
                                            <Cell class="center">{round(weekBest.fpts.starters.real)}</Cell>
                                        </Row>
                                    {/each}
                                </Body>
                            </DataTable>
                        {/if}
                    {:else if displayWeekRecord == 'worst'}
                        {#if displayRecords.weekLows.stats && displayRecords.weekLows.stats.length}
                            <DataTable class="playerTable" style="width: 450px;">
                                <Head>
                                    <Row>
                                        <Cell class="header" colspan=4>
                                            <p>
                                                Personal Worst Week Scores<br>
                                                {masterPrefix} - {recordPrefix} 
                                            </p>
                                        </Cell>  
                                    </Row>
                                    <Row>
                                        <Cell class="header"></Cell>
                                        {#if masterSelection == 'alltime'}
                                            <Cell class="header">Year</Cell>
                                        {/if}
                                        <Cell class="header">Week</Cell>
                                        <Cell class="header">PF</Cell>
                                    </Row>
                                </Head>
                                <Body>
                                    {#each displayRecords.weekLows.stats as weekWorst, ix}
                                        <Row>
                                            <Cell>{ix + 1}</Cell>
                                            {#if masterSelection == 'alltime'}				
                                                <Cell class="center">{weekWorst.year}</Cell>
                                            {/if}
                                            <Cell class="center">{weekWorst.week}</Cell>
                                            <Cell class="center">{round(weekWorst.fpts.starters.real)}</Cell>
                                        </Row>
                                    {/each}
                                </Body>
                            </DataTable>
                        {/if}
                    {/if}
                {:else}
                    <div class="showEmpty">{emptyMessage}</div>
                {/if}  
            </div>
            {#if masterSelection == 'alltime'}
                <div class="columnWrap">
                    <div class="buttonHolder">
                        <Group variant="outlined">
                            <Button class="selectionButtons" on:click={() => displaySeasonRecord = 'best'} variant="{displaySeasonRecord == 'best' ? "raised" : "outlined"}">
                                <Label>Best</Label>
                            </Button>
                            <Button class="selectionButtons" on:click={() => displaySeasonRecord = 'worst'} variant="{displaySeasonRecord == 'worst' ? "raised" : "outlined"}">
                                <Label>Worst</Label>
                            </Button>
                        </Group>
                    </div>
                    {#if showEmpty == false}
                        {#if displaySeasonRecord == 'best'}
                            {#if displayRecords.periodHighs.stats && displayRecords.periodHighs.stats.length}
                                <DataTable class="playerTable" style="width: 450px;">
                                    <Head>
                                        <Row>
                                            <Cell class="header" colspan=4>
                                                <p>
                                                    Personal Best Season-Long Scores<br>
                                                    {masterPrefix} - {recordPrefix} 
                                                </p>
                                            </Cell>  
                                        </Row>
                                        <Row>
                                            <Cell class="header"></Cell>
                                            {#if masterSelection == 'alltime'}
                                                <Cell class="header">Year</Cell>
                                            {/if}
                                            <Cell class="header">
                                                PF
                                                <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.periodHighs, displayRecords.periodHighs.stats, 'real')}>filter_list</Icon>
                                            </Cell>
                                            <Cell class="header">
                                                PPG
                                                <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.periodHighs, displayRecords.periodHighs.stats, 'realPPG')}>filter_list</Icon>
                                            </Cell>
                                        </Row>
                                    </Head>
                                    <Body>
                                        {#each displayRecords.periodHighs.stats as periodBest, ix (rand * (ix + 1))}
                                            {#if rand == 0}
                                                nothing
                                            {:else}
                                                <Row>
                                                    <Cell>{ix + 1}</Cell>
                                                    {#if masterSelection == 'alltime'}				
                                                        <Cell class="center">{periodBest.year}</Cell>
                                                    {/if}
                                                    <Cell class="center">{round(periodBest.fpts.starters.real)}</Cell>
                                                    <Cell class="center">{round(periodBest.fpts.starters.realPPG)}</Cell>
                                                </Row>
                                            {/if}
                                        {/each}
                                    </Body>
                                </DataTable>
                            {/if}
                        {:else if displaySeasonRecord == 'worst'}
                            {#if displayRecords.periodLows.stats && displayRecords.periodLows.stats.length}
                                <DataTable class="playerTable" style="width: 450px;">
                                    <Head>
                                        <Row>
                                            <Cell class="header" colspan=4>
                                                <p>
                                                    Personal Worst Season-Long Scores<br>
                                                    {masterPrefix} - {recordPrefix} 
                                                </p>
                                            </Cell>  
                                        </Row>
                                        <Row>
                                            <Cell class="header"></Cell>
                                            {#if masterSelection == 'alltime'}				
                                                <Cell class="header">Year</Cell>
                                            {/if}
                                            <Cell class="header">
                                                PF
                                                <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.periodLows, displayRecords.periodLows.stats, 'real')}>filter_list</Icon>
                                            </Cell>
                                            <Cell class="header">
                                                PPG
                                                <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.periodLows, displayRecords.periodLows.stats, 'realPPG')}>filter_list</Icon>
                                            </Cell>
                                        </Row>
                                    </Head>
                                    <Body>
                                        {#each displayRecords.periodLows.stats as periodWorst, ix (rand * (ix + 1))}
                                            {#if rand == 0}
                                                nothing
                                            {:else}
                                                <Row>
                                                    <Cell>{ix + 1}</Cell>
                                                    {#if masterSelection == 'alltime'}				
                                                        <Cell class="center">{periodWorst.year}</Cell>
                                                    {/if}
                                                    <Cell class="center">{round(periodWorst.fpts.starters.real)}</Cell>
                                                    <Cell class="center">{round(periodWorst.fpts.starters.realPPG)}</Cell>
                                                </Row>
                                            {/if}
                                        {/each}
                                    </Body>
                                </DataTable>
                            {/if}
                        {/if}
                    {:else}
                        <div class="showEmpty">{emptyMessage}</div>
                    {/if}                
                </div>
            {/if}
        </div>
        <div class="headerRow">
            <div class="headerLabel">Blowouts</div>
            <div class="headerLabel">Nailbiters</div>
        </div>
        <div class="recordsWrap">
            <div class="columnWrap">
                <div class="buttonHolder">
                    <Group variant="outlined">
                        <Button class="selectionButtons" on:click={() => displayBlowoutRecord = 'won'} variant="{displayBlowoutRecord == 'won' ? "raised" : "outlined"}">
                            <Label>Won</Label>
                        </Button>
                        <Button class="selectionButtons" on:click={() => displayBlowoutRecord = 'lost'} variant="{displayBlowoutRecord == 'lost' ? "raised" : "outlined"}">
                            <Label>Lost</Label>
                        </Button>
                    </Group>
                </div>
                {#if showEmpty == false}
                    {#if displayBlowoutRecord == 'won'}
                        {#if displayRecords.blowoutBests.stats && displayRecords.blowoutBests.stats.length}
                            <DataTable class="playerTable" style="width: 550px;">
                                <Head>
                                    <Row>
                                        <Cell class="header" colspan=7>
                                            <p>
                                                Top 10 Blowouts Won<br>
                                                {masterPrefix} - {recordPrefix} 
                                            </p>
                                        </Cell>                  
                                    </Row>
                                    <Row>
                                        <Cell class="header rank"></Cell>
                                        <Cell class="header">
                                            PF
                                            <br>
                                            (Proj)
                                        </Cell>
                                        <Cell class="header">Loser</Cell>
                                        <Cell class="header">
                                            PA
                                            <br>
                                            (Proj)
                                        </Cell>
                                        {#if masterSelection == 'alltime'}
                                            <Cell class="header">Year</Cell>
                                        {/if}
                                        <Cell class="header">Week</Cell>
                                        <Cell class="header">Margin</Cell>
                                    </Row>
                                </Head>
                                <Body>
                                    {#each displayRecords.blowoutBests.stats as blowoutBest, ix}
                                        <Row>
                                            <Cell class="rank">{ix + 1}</Cell>
                                            <Cell class="center" style="background-color: #0182c326;">{round(blowoutBest.fpts.starters.real)} <div style="font-size: 0.9em">({round(blowoutBest.fpts.starters.proj)})</div></Cell>
                                            <Cell class="cellName" style="background-color: #7a7a7a33;" on:click={() => gotoManager(blowoutBest.oppRecordManID)}>
                                                {blowoutBest.oppManager.realname}
                                                {#if masterSelection == 'yearly'}
                                                    <div class="fantasyTeamName">({blowoutBest.oppManager.name})</div>
                                                {/if}
                                            </Cell>
                                            <Cell class="center" style="background-color: #6a6a6a33;">{round(blowoutBest.fpts.opp.real)} <div style="font-size: 0.9em">({round(blowoutBest.fpts.opp.proj)})</div></Cell>
                                            {#if masterSelection == 'alltime'}
                                                <Cell class="center">{blowoutBest.year}</Cell>
                                            {/if}
                                            <Cell class="center">{blowoutBest.week}</Cell>
                                            <Cell class="center">{round(blowoutBest.matchDifferential)}</Cell>
                                        </Row>
                                    {/each}
                                </Body>
                            </DataTable>
                        {/if}
                    {:else if displayBlowoutRecord == 'lost'}
                        {#if displayRecords.blowoutWorsts.stats && displayRecords.blowoutWorsts.stats.length}
                            <DataTable class="playerTable" style="width: 550px;">
                                <Head>
                                    <Row>
                                        <Cell class="header" colspan=7>
                                            <p>
                                                Top 10 Blowouts Lost<br>
                                                {masterPrefix} - {recordPrefix} 
                                            </p>
                                        </Cell>                  
                                    </Row>
                                    <Row>
                                        <Cell class="header rank"></Cell>
                                        <Cell class="header">
                                            PF
                                            <br>
                                            (Proj)
                                        </Cell>
                                        <Cell class="header">Winner</Cell>
                                        <Cell class="header">
                                            PA
                                            <br>
                                            (Proj)
                                        </Cell>
                                        {#if masterSelection == 'alltime'}
                                            <Cell class="header">Year</Cell>
                                        {/if}
                                        <Cell class="header">Week</Cell>
                                        <Cell class="header">Margin</Cell>
                                    </Row>
                                </Head>
                                <Body>
                                    {#each displayRecords.blowoutWorsts.stats as blowoutWorst, ix}
                                        <Row>
                                            <Cell class="rank">{ix + 1}</Cell>
                                            <Cell class="center" style="background-color: #6a6a6a33;">{round(blowoutWorst.fpts.starters.real)} <div style="font-size: 0.9em">({round(blowoutWorst.fpts.starters.proj)})</div></Cell>
                                            <Cell class="cellName" style="background-color: #229bd924;" on:click={() => gotoManager(blowoutWorst.oppRecordManID)}>
                                                {blowoutWorst.oppManager.realname}
                                                {#if masterSelection == 'yearly'}
                                                    <div class="fantasyTeamName">({blowoutWorst.oppManager.name})</div>
                                                {/if}
                                            </Cell>
                                            <Cell class="center" style="background-color: #0182c326;">{round(blowoutWorst.fpts.opp.real)} <div style="font-size: 0.9em">({round(blowoutWorst.fpts.opp.proj)})</div></Cell>
                                            {#if masterSelection == 'alltime'}
                                                <Cell class="center">{blowoutWorst.year}</Cell>
                                            {/if}
                                            <Cell class="center">{blowoutWorst.week}</Cell>
                                            <Cell class="center">{round(blowoutWorst.matchDifferential)}</Cell>
                                        </Row>
                                    {/each}
                                </Body>
                            </DataTable>
                        {/if}
                    {/if}
                {:else}
                    <div class="showEmpty">{emptyMessage}</div>
                {/if}    
            </div>
            <div class="columnWrap">
                <div class="buttonHolder">
                    <Group variant="outlined">
                        <Button class="selectionButtons" on:click={() => displayNailbiterRecord = 'won'} variant="{displayNailbiterRecord == 'won' ? "raised" : "outlined"}">
                            <Label>Won</Label>
                        </Button>
                        <Button class="selectionButtons" on:click={() => displayNailbiterRecord = 'lost'} variant="{displayNailbiterRecord == 'lost' ? "raised" : "outlined"}">
                            <Label>Lost</Label>
                        </Button>
                    </Group>
                </div>
                {#if showEmpty == false}
                    {#if displayNailbiterRecord == 'won'}
                        {#if displayRecords.narrowBests.stats && displayRecords.narrowBests.stats.length}
                            <DataTable class="playerTable" style="width: 550px;">
                                <Head>
                                    <Row>
                                        <Cell class="header" colspan=7>
                                            <p>
                                                Top 10 Nailbiters Won<br>
                                                {masterPrefix} - {recordPrefix} 
                                            </p>
                                        </Cell>                  
                                    </Row>
                                    <Row>
                                        <Cell class="header rank"></Cell>
                                        <Cell class="header">
                                            PF
                                            <br>
                                            (Proj)
                                        </Cell>
                                        <Cell class="header">Loser</Cell>
                                        <Cell class="header">
                                            PA
                                            <br>
                                            (Proj)
                                        </Cell>
                                        {#if masterSelection == 'alltime'}
                                            <Cell class="header">Year</Cell>
                                        {/if}
                                        <Cell class="header">Week</Cell>
                                        <Cell class="header">Margin</Cell>
                                    </Row>
                                </Head>
                                <Body>
                                    {#each displayRecords.narrowBests.stats as narrowBest, ix}
                                        <Row>
                                            <Cell class="rank">{ix + 1}</Cell>
                                            <Cell class="center" style="background-color: #0182c326;">{round(narrowBest.fpts.starters.real)} <div style="font-size: 0.9em">({round(narrowBest.fpts.starters.proj)})</div></Cell>
                                            <Cell class="cellName" style="background-color: #7a7a7a33;" on:click={() => gotoManager(narrowBest.oppRecordManID)}>
                                                {narrowBest.oppManager.realname}
                                                {#if masterSelection == 'yearly'}
                                                    <div class="fantasyTeamName">({narrowBest.oppManager.name})</div>
                                                {/if}
                                            </Cell>
                                            <Cell class="center" style="background-color: #6a6a6a33;">{round(narrowBest.fpts.opp.real)} <div style="font-size: 0.9em">({round(narrowBest.fpts.opp.proj)})</div></Cell>
                                            {#if masterSelection == 'alltime'}
                                                <Cell class="center">{narrowBest.year}</Cell>
                                            {/if}
                                            <Cell class="center">{narrowBest.week}</Cell>
                                            <Cell class="center">{round(narrowBest.matchDifferential)}</Cell>
                                        </Row>
                                    {/each}
                                </Body>
                            </DataTable>
                        {/if}
                    {:else if displayNailbiterRecord == 'lost'}
                        {#if displayRecords.narrowWorsts.stats && displayRecords.narrowWorsts.stats.length}
                            <DataTable class="playerTable" style="width: 550px;">
                                <Head>
                                    <Row>
                                        <Cell class="header" colspan=7>
                                            <p>
                                                Top 10 Nailbiters Lost<br>
                                                {masterPrefix} - {recordPrefix} 
                                            </p>
                                        </Cell>                  
                                    </Row>
                                    <Row>
                                        <Cell class="header rank"></Cell>
                                        <Cell class="header">
                                            PF
                                            <br>
                                            (Proj)
                                        </Cell>
                                        <Cell class="header">Winner</Cell>
                                        <Cell class="header">
                                            PA
                                            <br>
                                            (Proj)
                                        </Cell>
                                        {#if masterSelection == 'alltime'}
                                            <Cell class="header">Year</Cell>
                                        {/if}
                                        <Cell class="header">Week</Cell>
                                        <Cell class="header">Margin</Cell>
                                    </Row>
                                </Head>
                                <Body>
                                    {#each displayRecords.narrowWorsts.stats as narrowWorst, ix}
                                        <Row>
                                            <Cell class="rank">{ix + 1}</Cell>
                                            <Cell class="center" style="background-color: #6a6a6a33;">{round(narrowWorst.fpts.starters.real)} <div style="font-size: 0.9em">({round(narrowWorst.fpts.starters.proj)})</div></Cell>
                                            <Cell class="cellName" style="background-color: #229bd924;" on:click={() => gotoManager(narrowWorst.oppRecordManID)}>
                                                {narrowWorst.oppManager.realname}
                                                {#if masterSelection == 'yearly'}
                                                    <div class="fantasyTeamName">({narrowWorst.oppManager.name})</div>
                                                {/if}
                                            </Cell>
                                            <Cell class="center" style="background-color: #0182c326;">{round(narrowWorst.fpts.opp.real)} <div style="font-size: 0.9em">({round(narrowWorst.fpts.opp.proj)})</div></Cell>
                                            {#if masterSelection == 'alltime'}
                                                <Cell class="center">{narrowWorst.year}</Cell>
                                            {/if}
                                            <Cell class="center">{narrowWorst.week}</Cell>
                                            <Cell class="center">{round(narrowWorst.matchDifferential)}</Cell>
                                        </Row>
                                    {/each}
                                </Body>
                            </DataTable>
                        {/if}
                    {/if}
                {:else}
                    <div class="showEmpty">{emptyMessage}</div>
                {/if}    
            </div>
        </div>
        <div class="headerRow">
            <div class="headerLabel" style="justify-content: center">Players</div>
        </div>
        <div class="recordsWrap">
            <div class="columnWrap" style="width: 98%;">
                <div class="buttonHolder">
                    <Group variant="outlined">
                        <Button class="selectionButtons" on:click={() => displayPlayerRecord = 'overall'} variant="{displayPlayerRecord == 'overall' ? "raised" : "outlined"}">
                            <Label>Overall</Label>
                        </Button>
                        <Button class="selectionButtons" on:click={() => displayPlayerRecord = 'week'} variant="{displayPlayerRecord == 'week' ? "raised" : "outlined"}">
                            <Label>Week</Label>
                        </Button>
                        <Button class="selectionButtons" on:click={() => displayPlayerRecord = 'season'} variant="{displayPlayerRecord == 'season' ? "raised" : "outlined"}">
                            <Label>Season</Label>
                        </Button>
                        <Button class="selectionButtons" on:click={() => displayPlayerRecord = 'breakouts'} variant="{displayPlayerRecord == 'breakouts' ? "raised" : "outlined"}">
                            <Label>Breakouts</Label>
                        </Button>
                        <Button class="selectionButtons" on:click={() => displayPlayerRecord = 'busts'} variant="{displayPlayerRecord == 'busts' ? "raised" : "outlined"}">
                            <Label>Busts</Label>
                        </Button>
                        <Button class="selectionButtons" on:click={() => displayPlayerRecord = 'bench'} variant="{displayPlayerRecord == 'bench' ? "raised" : "outlined"}">
                            <Label>Benchwarmers</Label>
                        </Button>
                    </Group>
                </div>
                <div class="buttonHolder" style="margin: 0.5em 0;">
                    <Group variant="outlined">
                        <Button class="selectionButtons" on:click={() => displayPositionRecord = 'ALL'} variant="{displayPositionRecord == 'ALL' ? "raised" : "outlined"}">
                            <Label>ALL</Label>
                        </Button>
                        {#each positionsArray as position}
                            <Button class="selectionButtons" on:click={() => displayPositionRecord = position} variant="{displayPositionRecord == position ? "raised" : "outlined"}">
                                <Label>{position}</Label>
                            </Button>
                        {/each}
                    </Group>
                </div>
                {#if showEmpty == false}
                    {#if displayPlayerRecord == 'overall'}
                        {#if displayRecords.players.gamesHighs.stats && displayRecords.players.gamesHighs.stats.length}
                            <DataTable class="playerTable">
                                <Head>
                                    <Row>
                                        <Cell class="header" colspan=12>
                                            <p>
                                                Most Weeks Started – {displayPositionRecord == 'ALL' ? 'Players' : displayPositionRecord}<br>
                                                {masterPrefix} – {recordPrefix} 
                                            </p>
                                        </Cell>                  
                                    </Row>
                                    <Row>
                                        <Cell class="header rank"></Cell>
                                        <Cell class="header rank" />
                                        <Cell class="header">Player</Cell>
                                        {#if displayPositionRecord == 'ALL'}
                                            <Cell class="header">POS</Cell>
                                        {/if}
                                        <Cell class="header">NFL Team</Cell>
                                        {#if masterSelection == 'alltime'}
                                            <Cell class="header">Seasons</Cell>
                                        {/if}
                                        <Cell class="header">
                                            Led 
                                            <br>
                                            Team
                                            <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.players.gamesHighs, displayRecords.players.gamesHighs.stats, 'topStarters', [])}>filter_list</Icon>
                                        </Cell>
                                        <Cell class="header">
                                            Team
                                            <br> 
                                            Bust
                                            <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.players.gamesHighs, displayRecords.players.gamesHighs.stats, 'bottomStarters', [])}>filter_list</Icon>
                                        </Cell>
                                        <Cell class="header">
                                            Average
                                            <br>
                                            Team Rank
                                            <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.players.gamesHighs, displayRecords.players.gamesHighs.stats, 'starterRankAVG', [], true)}>filter_list</Icon>
                                        </Cell>
                                        <Cell class="header">
                                            PF
                                            <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.players.gamesHighs, displayRecords.players.gamesHighs.stats, 'real', ['fpts', 'starters'])}>filter_list</Icon>
                                        </Cell>
                                        <Cell class="header">
                                            PPG
                                            <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.players.gamesHighs, displayRecords.players.gamesHighs.stats, 'realPPG', ['fpts', 'starters'])}>filter_list</Icon>
                                        </Cell>
                                        <Cell class="header">
                                            Starts
                                            <br>
                                            / Owned
                                            <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.players.gamesHighs, displayRecords.players.gamesHighs.stats, 'starters', ['weeks'])}>filter_list</Icon>
                                        </Cell>
                                    </Row>
                                </Head>
                                <Body>
                                    {#each displayRecords.players.gamesHighs.stats as player, ix (rand * (ix + 1))}
                                        {#if rand == 0}
                                            nothing
                                        {:else}
                                            <Row>
                                                <Cell class="rank">{ix + 1}</Cell>
                                                <Cell class="playerAvatar playerInfo" style="background-image: url('{player.avatar}'); vertical-align: middle; height: 45px; width: 45px; background-position: center; background-repeat: no-repeat; background-size: auto 45px;" />
                                                <Cell class="left">{player.playerInfo.fn} {player.playerInfo.ln}</Cell>
                                                {#if displayPositionRecord == 'ALL'}
                                                    <Cell class="center">
                                                        <div class="pos {player.playerInfo.pos}">
                                                            {player.playerInfo.pos}
                                                        </div>
                                                    </Cell>
                                                {/if}
                                                <Cell class="center">
                                                    <img class="teamAvatar" src="https://sleepercdn.com/images/team_logos/nfl/{player.team.toLowerCase()}.png" alt="{player.team}">
                                                </Cell>
                                                {#if masterSelection == 'alltime'}
                                                    <Cell class="center">{player.years.total}</Cell>
                                                {/if}
                                                <Cell class="center">{player.topStarters}</Cell>
                                                <Cell class="center">{player.bottomStarters}</Cell>
                                                <Cell class="center">{round(player.starterRankAVG)}</Cell>
                                                <Cell class="center">{round(player.fpts.starters.real)}</Cell>
                                                <Cell class="center">{round(player.fpts.starters.realPPG)}</Cell>
                                                <Cell class="center">{player.weeks.starters} / {player.weeks.total}</Cell>
                                            </Row>
                                        {/if}
                                    {/each}
                                </Body>
                            </DataTable>
                        {/if}
                        
                        {#if displayRecords.players.overallHighs.stats && displayRecords.players.overallHighs.stats.length}
                            <DataTable class="playerTable">
                                <Head>
                                    <Row>
                                        <Cell class="header" colspan=12>
                                            <p>
                                                Top Cumulative Scorers – {displayPositionRecord == 'ALL' ? 'Players' : displayPositionRecord}<br>
                                                {masterPrefix} – {recordPrefix} 
                                            </p>
                                        </Cell>                  
                                    </Row>
                                    <Row>
                                        <Cell class="header rank"></Cell>
                                        <Cell class="header rank" />
                                        <Cell class="header">Player</Cell>
                                        {#if displayPositionRecord == 'ALL'}
                                            <Cell class="header">POS</Cell>
                                        {/if}
                                        <Cell class="header">NFL Team</Cell>
                                        {#if masterSelection == 'alltime'}
                                            <Cell class="header">Seasons</Cell>
                                        {/if}
                                        <Cell class="header">
                                            Led 
                                            <br>
                                            Team
                                            <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.players.overallHighs, displayRecords.players.overallHighs.stats, 'topStarters', [])}>filter_list</Icon>
                                        </Cell>
                                        <Cell class="header">
                                            Team
                                            <br> 
                                            Bust
                                            <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.players.overallHighs, displayRecords.players.overallHighs.stats, 'bottomStarters', [])}>filter_list</Icon>
                                        </Cell>
                                        <Cell class="header">
                                            Average 
                                            <br>
                                            Team Rank
                                            <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.players.overallHighs, displayRecords.players.overallHighs.stats, 'starterRankAVG', [], true)}>filter_list</Icon>
                                        </Cell>
                                        <Cell class="header">
                                            Starts
                                            <br>
                                            / Owned
                                            <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.players.overallHighs, displayRecords.players.overallHighs.stats, 'starters', ['weeks'])}>filter_list</Icon>
                                        </Cell>
                                        <Cell class="header">
                                            PF
                                            <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.players.overallHighs, displayRecords.players.overallHighs.stats, 'real', ['fpts', 'starters'])}>filter_list</Icon>
                                        </Cell>
                                        <Cell class="header">
                                            PPG
                                            <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.players.overallHighs, displayRecords.players.overallHighs.stats, 'realPPG', ['fpts', 'starters'])}>filter_list</Icon>
                                        </Cell>
                                    </Row>
                                </Head>
                                <Body>
                                    {#each displayRecords.players.overallHighs.stats as player, ix (rand * (ix + 1))}
                                        {#if rand == 0}
                                            nothing
                                        {:else}
                                            <Row>
                                                <Cell class="rank">{ix + 1}</Cell>
                                                <Cell class="playerAvatar playerInfo" style="background-image: url('{player.avatar}'); vertical-align: middle; height: 45px; width: 45px; background-position: center; background-repeat: no-repeat; background-size: auto 45px;" />
                                                <Cell class="left">{player.playerInfo.fn} {player.playerInfo.ln}</Cell>
                                                {#if displayPositionRecord == 'ALL'}
                                                    <Cell class="center">
                                                        <div class="pos {player.playerInfo.pos}">
                                                            {player.playerInfo.pos}
                                                        </div>
                                                    </Cell>
                                                {/if}
                                                <Cell class="center">
                                                    <img class="teamAvatar" src="https://sleepercdn.com/images/team_logos/nfl/{player.team.toLowerCase()}.png" alt="{player.team}">
                                                </Cell>
                                                {#if masterSelection == 'alltime'}
                                                    <Cell class="center">{player.years.total}</Cell>
                                                {/if}
                                                <Cell class="center">{player.topStarters}</Cell>
                                                <Cell class="center">{player.bottomStarters}</Cell>
                                                <Cell class="center">{round(player.starterRankAVG)}</Cell>
                                                <Cell class="center">{player.weeks.starters} / {player.weeks.total}</Cell>
                                                <Cell class="center">{round(player.fpts.starters.real)}</Cell>
                                                <Cell class="center">{round(player.fpts.starters.realPPG)}</Cell>
                                            </Row>
                                        {/if}
                                    {/each}
                                </Body>
                            </DataTable>
                        {/if}
                    {:else if displayPlayerRecord == 'week'}
                        {#if displayRecords.players.weekHighs.stats && displayRecords.players.weekHighs.stats.length}
                            <DataTable class="playerTable">
                                <Head>
                                    <Row>
                                        <Cell class="header" colspan=8>
                                            <p>
                                                Top 10 Week Scores - {displayPositionRecord == 'ALL' ? 'Players' : displayPositionRecord}<br>
                                                {masterPrefix} - {recordPrefix} 
                                            </p>
                                        </Cell>                  
                                    </Row>
                                    <Row>
                                        <Cell class="header rank"></Cell>
                                        <Cell class="header rank" style="background-color: var(--gcMain);" />
                                        <Cell class="header">Player</Cell>
                                        {#if displayPositionRecord == 'ALL'}
                                            <Cell class="header">POS</Cell>
                                        {/if}
                                        <Cell class="header">NFL Team</Cell>
                                        {#if masterSelection == 'alltime'}
                                            <Cell class="header">Year</Cell>
                                        {/if}
                                        <Cell class="header">Week</Cell>
                                        <Cell class="header">PF</Cell>
                                    </Row>
                                </Head>
                                <Body>
                                    {#each displayRecords.players.weekHighs.stats as playerWeekBest, ix}
                                        <Row>
                                            <Cell class="rank">{ix + 1}</Cell>
                                            <Cell class="playerAvatar playerInfo" style="background-image: url('{playerWeekBest.avatar}'); background-color: var(--gcSelect); vertical-align: middle; height: 45px; width: 45px; background-position: center; background-repeat: no-repeat; background-size: auto 45px;" />
                                            <Cell class="left">{playerWeekBest.playerInfo.fn} {playerWeekBest.playerInfo.ln}</Cell>
                                            {#if displayPositionRecord == 'ALL'}
                                                <Cell class="center">{playerWeekBest.playerInfo.pos}</Cell>
                                            {/if}
                                            <Cell class="center">
                                                <img class="teamAvatar" src="https://sleepercdn.com/images/team_logos/nfl/{playerWeekBest.team.toLowerCase()}.png" alt="{playerWeekBest.team}">
                                            </Cell>
                                            {#if masterSelection == 'alltime'}
                                                <Cell class="center">{playerWeekBest.year}</Cell>
                                            {/if}
                                            <Cell class="center">{playerWeekBest.week}</Cell>
                                            <Cell class="center">{round(playerWeekBest.fpts)}</Cell>
                                        </Row>
                                    {/each}
                                </Body>
                            </DataTable>
                        {/if}
                    {:else if displayPlayerRecord == 'season'}
                        {#if displayRecords.players.periodHighs.stats && displayRecords.players.periodHighs.stats.length}
                            <DataTable class="playerTable">
                                <Head>
                                    <Row>
                                        <Cell class="header" colspan=12>
                                            <p>
                                                Top 10 Season-Long Scores – {displayPositionRecord == 'ALL' ? 'Players' : displayPositionRecord}<br>
                                                {masterPrefix} - {recordPrefix} 
                                            </p>
                                        </Cell>                  
                                    </Row>
                                    <Row>
                                        <Cell class="header rank"></Cell>
                                        <Cell class="header rank"  style="background-color: var(--gcMain);" />
                                        <Cell class="header">Player</Cell>
                                        {#if displayPositionRecord == 'ALL'}
                                            <Cell class="header">POS</Cell>
                                        {/if}
                                        <Cell class="header">NFL Team</Cell>
                                        {#if masterSelection == 'alltime'}
                                            <Cell class="header">Year</Cell>
                                        {/if}
                                        <Cell class="header">
                                            Led 
                                            <br>
                                            Team
                                            <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.players.periodHighs, displayRecords.players.periodHighs.stats, 'topStarters', [])}>filter_list</Icon>
                                        </Cell>
                                        <Cell class="header">
                                            Team 
                                            <br>
                                            Bust
                                            <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.players.periodHighs, displayRecords.players.periodHighs.stats, 'bottomStarters', [])}>filter_list</Icon>
                                        </Cell>
                                        <Cell class="header">
                                            Average 
                                            <br>
                                            Team Rank
                                            <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.players.periodHighs, displayRecords.players.periodHighs.stats, 'starterRankAVG', [], true)}>filter_list</Icon>
                                        </Cell>
                                        <Cell class="header">
                                            Starts
                                            <br>
                                            / Owned
                                            <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.players.periodHighs, displayRecords.players.periodHighs.stats, 'starters', ['weeks'])}>filter_list</Icon>
                                        </Cell>
                                        <Cell class="header">
                                            PF
                                            <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.players.periodHighs, displayRecords.players.periodHighs.stats, 'real', ['fpts', 'starters'])}>filter_list</Icon>
                                        </Cell>
                                        <Cell class="header">
                                            PPG
                                            <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.players.periodHighs, displayRecords.players.periodHighs.stats, 'realPPG', ['fpts', 'starters'])}>filter_list</Icon>
                                        </Cell>
                                    </Row>
                                </Head>
                                <Body>
                                    {#each displayRecords.players.periodHighs.stats as playerPeriodBest, ix (rand * (ix + 1))}
                                        {#if rand == 0}
                                            nothing
                                        {:else}
                                            <Row>
                                                <Cell class="rank">{ix + 1}</Cell>
                                                <Cell class="playerAvatar playerInfo" style="background-image: url('{playerPeriodBest.avatar}'); background-color: var(--gcSelect); vertical-align: middle; height: 45px; width: 45px; background-position: center; background-repeat: no-repeat; background-size: auto 45px;" />
                                                <Cell class="left">{playerPeriodBest.playerInfo.fn} {playerPeriodBest.playerInfo.ln}</Cell>
                                                {#if displayPositionRecord == 'ALL'}
                                                    <Cell class="center">{playerPeriodBest.playerInfo.pos}</Cell>
                                                {/if}
                                                <Cell class="center">
                                                    <img class="teamAvatar" src="https://sleepercdn.com/images/team_logos/nfl/{playerPeriodBest.team.toLowerCase()}.png" alt="{playerPeriodBest.team}">
                                                </Cell>                                                
                                                {#if masterSelection == 'alltime'}
                                                    <Cell class="center">{playerPeriodBest.year}</Cell>
                                                {/if}
                                                <Cell class="center">{playerPeriodBest.topStarters}</Cell>
                                                <Cell class="center">{playerPeriodBest.bottomStarters}</Cell>
                                                <Cell class="center">{round(playerPeriodBest.starterRankAVG)}</Cell>
                                                <Cell class="center">{playerPeriodBest.weeks.starters} / {playerPeriodBest.weeks.total}</Cell>
                                                <Cell class="center">{round(playerPeriodBest.fpts.starters.real)}</Cell>
                                                <Cell class="center">{round(playerPeriodBest.fpts.starters.realPPG)}</Cell>
                                            </Row>
                                        {/if}
                                    {/each}
                                </Body>
                            </DataTable>
                        {/if}
                    {:else if displayPlayerRecord == 'breakouts'}
                        {#if displayRecords.players.seasonOvers.stats && displayRecords.players.seasonOvers.stats.length}
                            <DataTable class="playerTable">
                                <Head>
                                    <Row>
                                        <Cell class="header" colspan=13>
                                            <p>
                                                Biggest Season-Long Breakouts – {displayPositionRecord == 'ALL' ? 'Players' : displayPositionRecord}<br>
                                                {masterPrefix} – {recordPrefix} 
                                            </p>
                                        </Cell>  
                                    </Row>
                                    <Row>
                                        <Cell class="header rank"></Cell>
                                        <Cell class="header rank" />
                                        <Cell class="header">Player</Cell>
                                        <Cell class="header">POS</Cell>
                                        <Cell class="header">NFL Team</Cell>
                                        {#if masterSelection == 'alltime'}
                                            <Cell class="header">Year</Cell>
                                        {/if}
                                        <Cell class="header">
                                            Led 
                                            <br>
                                            Team
                                            <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.seasonOvers, displayRecords.players.seasonOvers.stats, 'topStarters', [])}>filter_list</Icon>
                                        </Cell>
                                        <Cell class="header">
                                            Team 
                                            <br>
                                            Bust
                                            <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.seasonOvers, displayRecords.players.seasonOvers.stats, 'bottomStarters', [])}>filter_list</Icon>
                                        </Cell>
                                        <Cell class="header">
                                            Average
                                            <br>
                                            Team Rank
                                            <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.seasonOvers, displayRecords.players.seasonOvers.stats, 'starterRankAVG', [], true)}>filter_list</Icon>
                                        </Cell>
                                        <Cell class="header">
                                            Starts
                                            <br>
                                            / Owned
                                            <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.seasonOvers, displayRecords.players.seasonOvers.stats, 'starters', ['weeks'])}>filter_list</Icon>
                                        </Cell>
                                        <Cell class="header">
                                            PF
                                            <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.seasonOvers, displayRecords.players.seasonOvers.stats, 'real', ['fpts', 'starters'])}>filter_list</Icon>
                                            <br>
                                            (PPG)
                                            <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.seasonOvers, displayRecords.players.seasonOvers.stats, 'realPPG', ['fpts', 'starters'])}>filter_list</Icon>
                                        </Cell>
                                        <Cell class="header">
                                            Proj PF
                                            <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.seasonOvers, displayRecords.players.seasonOvers.stats, 'proj', ['fpts', 'starters'])}>filter_list</Icon>
                                            <br>
                                            (PPG)
                                            <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.seasonOvers, displayRecords.players.seasonOvers.stats, 'projPPG', ['fpts', 'starters'])}>filter_list</Icon>
                                        </Cell>
                                        <Cell class="header">
                                            Diff
                                            <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.seasonOvers, displayRecords.players.seasonOvers.stats, 'diff', ['fpts', 'starters'])}>filter_list</Icon>
                                            <br>
                                            Diff PG
                                            <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.seasonOvers, displayRecords.players.seasonOvers.stats, 'diffPG', ['fpts', 'starters'])}>filter_list</Icon>
                                        </Cell>
                                    </Row>
                                </Head>
                                <Body>
                                    {#each displayRecords.players.seasonOvers.stats as seasonBestOver, ix (rand * (ix + 1))}
                                        {#if rand == 0}
                                            nothing
                                        {:else}
                                            <Row>
                                                <Cell class="rank">{ix + 1}</Cell>
                                                <Cell class="playerAvatar playerInfo" style="background-image: url('{seasonBestOver.avatar}'); vertical-align: middle; height: 45px; width: 45px; background-position: center; background-repeat: no-repeat; background-size: auto 45px;" />
                                                <Cell class="left">{seasonBestOver.playerInfo.fn} {seasonBestOver.playerInfo.ln}</Cell>
                                                <Cell class="center">
                                                    <div class="pos {seasonBestOver.playerInfo.pos}">
                                                        {seasonBestOver.playerInfo.pos}
                                                    </div>
                                                </Cell>
                                                <Cell class="center">
                                                    <img class="teamAvatar" src="https://sleepercdn.com/images/team_logos/nfl/{seasonBestOver.team.toLowerCase()}.png" alt="{seasonBestOver.team}">
                                                </Cell>
                                                {#if masterSelection == 'alltime'}
                                                    <Cell class="center">{seasonBestOver.year}</Cell>
                                                {/if}
                                                <Cell class="center">{seasonBestOver.topStarters}</Cell>
                                                <Cell class="center">{seasonBestOver.bottomStarters}</Cell>
                                                <Cell class="center">{round(seasonBestOver.starterRankAVG)}</Cell>
                                                <Cell class="center">{seasonBestOver.weeks.starters} / {seasonBestOver.weeks.total}</Cell>
                                                <Cell class="center">{round(seasonBestOver.fpts.starters.real)} <div style="font-size: 0.9em">{round(seasonBestOver.fpts.starters.realPPG)}</Cell>
                                                <Cell class="center">{round(seasonBestOver.fpts.starters.proj)} <div style="font-size: 0.9em">{round(seasonBestOver.fpts.starters.projPPG)}</Cell>
                                                <Cell class="center">{round(seasonBestOver.fpts.starters.diff)} <div style="font-size: 0.9em">{round(seasonBestOver.fpts.starters.diffPG)}</div></Cell>
                                            </Row>
                                        {/if}
                                    {/each}
                                </Body>
                            </DataTable>
                        {/if}
                
                        {#if displayRecords.players.weekOvers.stats && displayRecords.players.weekOvers.stats.length}
                            <DataTable class="playerTable">
                                <Head>
                                    <Row>
                                        <Cell class="header" colspan=10>
                                            <p>
                                                Biggest Single-Week Breakouts – {displayPositionRecord == 'ALL' ? 'Players' : displayPositionRecord}<br>
                                                {masterPrefix} – {recordPrefix} 
                                            </p>
                                        </Cell>  
                                    </Row>
                                    <Row>
                                        <Cell class="header rank"></Cell>
                                        <Cell class="header rank" />
                                        <Cell class="header">Player</Cell>
                                        <Cell class="header">POS</Cell>
                                        <Cell class="header">NFL Team</Cell>
                                        {#if masterSelection == 'alltime'}
                                            <Cell class="header">Year</Cell>
                                        {/if}
                                        <Cell class="header">Week</Cell>
                                        <Cell class="header">
                                            PF
                                            <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.weekOvers, displayRecords.players.weekOvers.stats, 'fpts')}>filter_list</Icon>
                                        </Cell>
                                        <Cell class="header">
                                            Proj PF
                                            <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.weekOvers, displayRecords.players.weekOvers.stats, 'projFpts')}>filter_list</Icon>
                                        </Cell>
                                        <Cell class="header">
                                            Diff
                                            <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.weekOvers, displayRecords.players.weekOvers.stats, 'projDiff')}>filter_list</Icon>
                                        </Cell>
                                    </Row>
                                </Head>
                                <Body>
                                    {#each displayRecords.players.weekOvers.stats as weekBestOver, ix (rand * (ix + 1))}
                                        {#if rand == 0}
                                            nothing
                                        {:else}
                                            <Row>
                                                <Cell class="rank">{ix + 1}</Cell>
                                                <Cell class="playerAvatar playerInfo" style="background-image: url('{weekBestOver.avatar}'); vertical-align: middle; height: 45px; width: 45px; background-position: center; background-repeat: no-repeat; background-size: auto 45px;" />
                                                <Cell class="left">{weekBestOver.playerInfo.fn} {weekBestOver.playerInfo.ln}</Cell>
                                                <Cell class="center">
                                                    <div class="pos {weekBestOver.playerInfo.pos}">
                                                        {weekBestOver.playerInfo.pos}
                                                    </div>
                                                </Cell>
                                                <Cell class="center">
                                                    <img class="teamAvatar" src="https://sleepercdn.com/images/team_logos/nfl/{weekBestOver.team.toLowerCase()}.png" alt="{weekBestOver.team}">
                                                </Cell>
                                                {#if masterSelection == 'alltime'}
                                                    <Cell class="center">{weekBestOver.year}</Cell>
                                                {/if}
                                                <Cell class="center">{weekBestOver.week}</Cell>
                                                <Cell class="center">{round(weekBestOver.fpts)}</Cell>
                                                <Cell class="center">{round(weekBestOver.projFpts)}</Cell>
                                                <Cell class="center">{round(weekBestOver.projDiff)}</Cell>
                                            </Row>
                                        {/if}
                                    {/each}
                                </Body>
                            </DataTable>
                        {/if}
                    {:else if displayPlayerRecord == 'busts'}
                        {#if displayRecords.players.seasonUnders.stats && displayRecords.players.seasonUnders.stats.length}
                            <DataTable class="playerTable">
                                <Head>
                                    <Row>
                                        <Cell class="header" colspan=13>
                                            <p>
                                                Biggest Season-Long Busts – {displayPositionRecord == 'ALL' ? 'Players' : displayPositionRecord}<br>
                                                {masterPrefix} – {recordPrefix} 
                                            </p>
                                        </Cell>  
                                    </Row>
                                    <Row>
                                        <Cell class="header rank"></Cell>
                                        <Cell class="header rank" />
                                        <Cell class="header">Player</Cell>
                                        <Cell class="header">POS</Cell>
                                        <Cell class="header">NFL Team</Cell>
                                        {#if masterSelection == 'alltime'}
                                            <Cell class="header">Year</Cell>
                                        {/if}
                                        <Cell class="header">
                                            Led 
                                            <br>
                                            Team
                                            <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.seasonUnders, displayRecords.players.seasonUnders.stats, 'topStarters', [])}>filter_list</Icon>
                                        </Cell>
                                        <Cell class="header">
                                            Team 
                                            <br>
                                            Bust
                                            <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.seasonUnders, displayRecords.players.seasonUnders.stats, 'bottomStarters', [])}>filter_list</Icon>
                                        </Cell>
                                        <Cell class="header">
                                            Average 
                                            <br>
                                            Team Rank
                                            <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.seasonUnders, displayRecords.players.seasonUnders.stats, 'starterRankAVG', [], true)}>filter_list</Icon>
                                        </Cell>
                                        <Cell class="header">
                                            Starts
                                            <br>
                                            / Owned
                                            <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.seasonUnders, displayRecords.players.seasonUnders.stats, 'starters', ['weeks'])}>filter_list</Icon>
                                        </Cell>
                                        <Cell class="header">
                                            PF
                                            <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.seasonUnders, displayRecords.players.seasonUnders.stats, 'real', ['fpts', 'starters'])}>filter_list</Icon>
                                            <br>
                                            (PPG)
                                            <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.seasonUnders, displayRecords.players.seasonUnders.stats, 'realPPG', ['fpts', 'starters'])}>filter_list</Icon>
                                        </Cell>
                                        <Cell class="header">
                                            Proj PF
                                            <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.seasonUnders, displayRecords.players.seasonUnders.stats, 'proj', ['fpts', 'starters'])}>filter_list</Icon>
                                            <br>
                                            (PPG)
                                            <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.seasonUnders, displayRecords.players.seasonUnders.stats, 'projPPG', ['fpts', 'starters'])}>filter_list</Icon>
                                        </Cell>
                                        <Cell class="header">
                                            Diff
                                            <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.seasonUnders, displayRecords.players.seasonUnders.stats, 'diff', ['fpts', 'starters'], true)}>filter_list</Icon>
                                            <br>
                                            (Diff PG)
                                            <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.seasonUnders, displayRecords.players.seasonUnders.stats, 'diffPG', ['fpts', 'starters'], true)}>filter_list</Icon>
                                        </Cell>
                                    </Row>
                                </Head>
                                <Body>
                                    {#each displayRecords.players.seasonUnders.stats as seasonBestUnder, ix (rand * (ix + 1))}
                                        {#if rand == 0}
                                            nothing
                                        {:else}
                                            <Row>
                                                <Cell class="rank">{ix + 1}</Cell>
                                                <Cell class="playerAvatar playerInfo" style="background-image: url('{seasonBestUnder.avatar}'); vertical-align: middle; height: 45px; width: 45px; background-position: center; background-repeat: no-repeat; background-size: auto 45px;" />
                                                <Cell class="left">{seasonBestUnder.playerInfo.fn} {seasonBestUnder.playerInfo.ln}</Cell>
                                                <Cell class="center">
                                                    <div class="pos {seasonBestUnder.playerInfo.pos}">
                                                        {seasonBestUnder.playerInfo.pos}
                                                    </div>
                                                </Cell>
                                                <Cell class="center">
                                                    <img class="teamAvatar" src="https://sleepercdn.com/images/team_logos/nfl/{seasonBestUnder.team.toLowerCase()}.png" alt="{seasonBestUnder.team}">
                                                </Cell>
                                                {#if masterPrefix == 'alltime'}
                                                    <Cell class="center">{seasonBestUnder.year}</Cell>
                                                {/if}
                                                <Cell class="center">{seasonBestUnder.topStarters}</Cell>
                                                <Cell class="center">{seasonBestUnder.bottomStarters}</Cell>
                                                <Cell class="center">{round(seasonBestUnder.starterRankAVG)}</Cell>
                                                <Cell class="center">{seasonBestUnder.weeks.starters} / {seasonBestUnder.weeks.total}</Cell>
                                                <Cell class="center">{round(seasonBestUnder.fpts.starters.real)} <div style="font-size: 0.9em">{round(seasonBestUnder.fpts.starters.realPPG)}</div></Cell>
                                                <Cell class="center">{round(seasonBestUnder.fpts.starters.proj)} <div style="font-size: 0.9em">{round(seasonBestUnder.fpts.starters.projPPG)}</div></Cell>
                                                <Cell class="center">{round(seasonBestUnder.fpts.starters.diff)} <div style="font-size: 0.9em">{round(seasonBestUnder.fpts.starters.diffPG)}</div></Cell>
                                            </Row>
                                        {/if}
                                    {/each}
                                </Body>
                            </DataTable>
                        {/if}
                
                        {#if displayRecords.players.weekUnders.stats && displayRecords.players.weekUnders.stats.length}
                            <DataTable class="playerTable">
                                <Head>
                                    <Row>
                                        <Cell class="header" colspan=10>
                                            <p>
                                                Biggest Single-Week Busts – {displayPositionRecord == 'ALL' ? 'Players' : displayPositionRecord}<br>
                                                {masterPrefix} – {recordPrefix} 
                                            </p>
                                        </Cell>  
                                    </Row>
                                    <Row>
                                        <Cell class="header rank"></Cell>
                                        <Cell class="header rank" />
                                        <Cell class="header">Player</Cell>
                                        <Cell class="header">POS</Cell>
                                        <Cell class="header">NFL Team</Cell>
                                        {#if masterSelection == 'alltime'}
                                            <Cell class="header">Year</Cell>
                                        {/if}
                                        <Cell class="header">Week</Cell>
                                        <Cell class="header">
                                            PF
                                            <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.weekUnders, displayRecords.players.weekUnders.stats, 'fpts')}>filter_list</Icon>
                                        </Cell>
                                        <Cell class="header">
                                            Proj PF
                                            <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.weekUnders, displayRecords.players.weekUnders.stats, 'projFpts')}>filter_list</Icon>
                                        </Cell>
                                        <Cell class="header">
                                            Diff
                                            <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.weekUnders, displayRecords.players.weekUnders.stats, 'projDiff', true)}>filter_list</Icon>
                                        </Cell>
                                    </Row>
                                </Head>
                                <Body>
                                    {#each displayRecords.players.weekUnders.stats as weekBestUnder, ix (rand * (ix + 1))}
                                        {#if rand == 0}
                                            nothing
                                        {:else}
                                            <Row>
                                                <Cell class="rank">{ix + 1}</Cell>
                                                <Cell class="playerAvatar playerInfo" style="background-image: url('{weekBestUnder.avatar}'); vertical-align: middle; height: 45px; width: 45px; background-position: center; background-repeat: no-repeat; background-size: auto 45px;" />
                                                <Cell class="left">{weekBestUnder.playerInfo.fn} {weekBestUnder.playerInfo.ln}</Cell>
                                                <Cell class="center">
                                                    <div class="pos {weekBestUnder.playerInfo.pos}">
                                                        {weekBestUnder.playerInfo.pos}
                                                    </div>
                                                </Cell>
                                                <Cell class="center">
                                                    <img class="teamAvatar" src="https://sleepercdn.com/images/team_logos/nfl/{weekBestUnder.team.toLowerCase()}.png" alt="{weekBestUnder.team}">
                                                </Cell>
                                                {#if masterSelection == 'alltime'}
                                                    <Cell class="center">{weekBestUnder.year}</Cell>
                                                {/if}
                                                <Cell class="center">{weekBestUnder.week}</Cell>
                                                <Cell class="center">{round(weekBestUnder.fpts)}</Cell>
                                                <Cell class="center">{round(weekBestUnder.projFpts)}</Cell>
                                                <Cell class="center">{round(weekBestUnder.projDiff)}</Cell>
                                            </Row>
                                        {/if}
                                    {/each}
                                </Body>
                            </DataTable>
                        {/if}
                    {:else if displayPlayerRecord == 'bench'}
                        {#if displayRecords.players.weekMissedHighs.stats && displayRecords.players.weekMissedHighs.stats.length}
                            <DataTable class="playerTable">
                                <Head>
                                    <Row>
                                        <Cell class="header" colspan=8>
                                            <p>
                                                Top 10 Benchwarmers – {displayPositionRecord == 'ALL' ? 'Players' : displayPositionRecord}<br>
                                                {masterPrefix} - {recordPrefix} 
                                            </p>
                                        </Cell>                  
                                    </Row>
                                    <Row>
                                        <Cell class="header rank"></Cell>
                                        <Cell class="header rank"  style="background-color: var(--gcMain);" /> 
                                        <Cell class="header">Player</Cell>
                                        {#if displayPositionRecord == 'ALL'}
                                            <Cell class="header">POS</Cell>
                                        {/if}
                                        <Cell class="header">NFL Team</Cell>
                                        {#if masterSelection == 'alltime'}
                                            <Cell class="header">Year</Cell>
                                        {/if}
                                        <Cell class="header">Week</Cell>
                                        <Cell class="header">PF</Cell>
                                    </Row>
                                </Head>
                                <Body>
                                    {#each displayRecords.players.weekMissedHighs.stats as playerWeekMissedBest, ix}
                                        <Row>
                                            <Cell class="rank">{ix + 1}</Cell>
                                            <Cell class="playerAvatar playerInfo" style="background-image: url('{playerWeekMissedBest.avatar}'); background-color: var(--gcSelect); vertical-align: middle; height: 45px; width: 45px; background-position: center; background-repeat: no-repeat; background-size: auto 45px;" />
                                            <Cell class="left">{playerWeekMissedBest.playerInfo.fn} {playerWeekMissedBest.playerInfo.ln}</Cell>
                                            {#if displayPositionRecord == 'ALL'}
                                                <Cell class="center">
                                                    <div class="pos {playerWeekMissedBest.playerInfo.pos}">
                                                        {playerWeekMissedBest.playerInfo.pos}
                                                    </div>
                                                </Cell>
                                            {/if}
                                            <Cell class="center">
                                                <img class="teamAvatar" src="https://sleepercdn.com/images/team_logos/nfl/{playerWeekMissedBest.team.toLowerCase()}.png" alt="{playerWeekMissedBest.team}">
                                            </Cell>                                            
                                            {#if masterSelection == 'alltime'}
                                                <Cell class="center">{playerWeekMissedBest.year}</Cell>
                                            {/if}
                                            <Cell class="center">{playerWeekMissedBest.week}</Cell>
                                            <Cell class="center">{round(playerWeekMissedBest.fpts)}</Cell>
                                        </Row>
                                    {/each}
                                </Body>
                            </DataTable>
                        {/if}
                        {#if displayRecords.players.overallMissedHighs.stats && displayRecords.players.overallMissedHighs.stats.length}
                            <DataTable class="recordTable">
                                <Head>
                                    <Row>
                                        <Cell class="header" colspan=9>
                                            <p>
                                                All-Around Bench Scoring Leaders – {displayPositionRecord == 'ALL' ? 'Players' : displayPositionRecord}<br>
                                                {masterPrefix} – {recordPrefix} 
                                            </p>
                                        </Cell>                  
                                    </Row>
                                    <Row>
                                        <Cell class="header rank"></Cell>
                                        <Cell class="header rank" /> 
                                        <Cell class="header">Player</Cell>
                                        {#if displayPositionRecord == 'ALL'}
                                            <Cell class="header">POS</Cell>
                                        {/if}
                                        <Cell class="header">NFL Team</Cell>
                                        {#if masterSelection == 'alltime'}
                                            <Cell class="header">Seasons</Cell>
                                        {/if}
                                        <Cell class="header">
                                            Benched
                                            <br>
                                            / Owned
                                            <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.players.overallMissedHighs, displayRecords.players.overallMissedHighs.stats, 'bench')}>filter_list</Icon>
                                        </Cell>
                                        <Cell class="header">
                                            BP
                                            <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.players.overallMissedHighs, displayRecords.players.overallMissedHighs.stats, 'real')}>filter_list</Icon>
                                        </Cell>
                                        <Cell class="header">
                                            BPPG
                                            <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.players.overallMissedHighs, displayRecords.players.overallMissedHighs.stats, 'realPPG')}>filter_list</Icon>
                                        </Cell>
                                    </Row>
                                </Head>
                                <Body>
                                    {#each displayRecords.players.overallMissedHighs.stats as player, ix (rand * (ix + 1))}
                                        {#if rand == 0}
                                            nothing
                                        {:else}
                                            <Row>
                                                <Cell class="rank">{ix + 1}</Cell>
                                                <Cell class="playerAvatar playerInfo" style="background-image: url('{player.avatar}'); vertical-align: middle; height: 45px; width: 45px; background-position: center; background-repeat: no-repeat; background-size: auto 45px;" />
                                                <Cell class="left">{player.playerInfo.fn} {player.playerInfo.ln}</Cell>
                                                {#if displayPositionRecord == 'ALL'}
                                                    <Cell class="center">
                                                        <div class="pos {player.playerInfo.pos}">
                                                            {player.playerInfo.pos}
                                                        </div>
                                                    </Cell>
                                                {/if}
                                                <Cell class="center">
                                                    <img class="teamAvatar" src="https://sleepercdn.com/images/team_logos/nfl/{player.team.toLowerCase()}.png" alt="{player.team}">
                                                </Cell>
                                                {#if masterSelection == 'alltime'}
                                                    <Cell class="center">{player.years.total}</Cell>
                                                {/if}
                                                <Cell class="center">{player.weeks.bench} / {player.weeks.total}</Cell>
                                                <Cell class="center">{round(player.fpts.bench.real)}</Cell>
                                                <Cell class="center">{round(player.fpts.bench.realPPG)}</Cell>
                                            </Row>
                                        {/if}
                                    {/each}
                                </Body>
                            </DataTable>
                        {/if}
                    {/if}
                {:else}
                    <div class="showEmpty">{emptyMessage}</div>
                {/if}    
            </div>
        </div>
        <div class="headerRow">
            <div class="headerLabel" style="justify-content: center">Head to Head</div>
        </div>
        <div class="recordsWrap">
            <div class="columnWrap" style="width: 98%;">
                {#if showEmpty == false}
                    {#if displayRecords.headToHeads.stats && displayRecords.headToHeads.stats.length}
                        <DataTable class="playerTable">
                            <Head>
                                <Row>
                                    <Cell class="header" colspan=17>
                                        <p>
                                            Records Against Other Managers<br>
                                            {recordPrefix} 
                                        </p>
                                    </Cell>  
                                </Row>
                                <Row>
                                    <Cell class="header"></Cell>
                                    <Cell class="header">
                                        VS.
                                        <br> 
                                        Manager
                                    </Cell>
                                    <Cell class="header">
                                        Win %
                                        <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.headToHeads, displayRecords.headToHeads.stats, 'perc', ['outcomes', 'match'])}>filter_list</Icon>
                                        <br>
                                        (EPE %)
                                        <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.headToHeads, displayRecords.headToHeads.stats, 'perc', ['outcomes', 'EPE'])}>filter_list</Icon>
                                    </Cell>
                                    <Cell class="header">
                                        W
                                        <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.headToHeads, displayRecords.headToHeads.stats, 'W', ['outcomes', 'match'])}>filter_list</Icon>
                                        <br>
                                        (EPE W)
                                        <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.headToHeads, displayRecords.headToHeads.stats, 'W', ['outcomes', 'EPE'])}>filter_list</Icon>
                                    </Cell>
                                    {#if showTies.headTable.match || showTies.headTable.EPE}
                                        <Cell class="header">
                                            T
                                            <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.headToHeads, displayRecords.headToHeads.stats, 'T', ['outcomes', 'match'])}>filter_list</Icon>
                                            <br>
                                            (EPE T)
                                            <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.headToHeads, displayRecords.headToHeads.stats, 'T', ['outcomes', 'EPE'])}>filter_list</Icon>
                                        </Cell>
                                    {/if}
                                    <Cell class="header">
                                        L
                                        <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.headToHeads, displayRecords.headToHeads.stats, 'L', ['outcomes', 'match'])}>filter_list</Icon>
                                        <br>
                                        (EPE L)
                                        <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.headToHeads, displayRecords.headToHeads.stats, 'L', ['outcomes', 'EPE'])}>filter_list</Icon>
                                    </Cell>
                                    <Cell class="header">
                                        IQ Win %
                                        <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.headToHeads, displayRecords.headToHeads.stats, 'perc', ['outcomes', 'iq'])}>filter_list</Icon>
                                        <br>
                                        (EPE %)
                                        <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.headToHeads, displayRecords.headToHeads.stats, 'perc', ['outcomes', 'iqEPE'])}>filter_list</Icon>
                                    </Cell>
                                    <Cell class="header">
                                        IQ W
                                        <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.headToHeads, displayRecords.headToHeads.stats, 'W', ['outcomes', 'iq'])}>filter_list</Icon>
                                        <br>
                                        (EPE W)
                                        <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.headToHeads, displayRecords.headToHeads.stats, 'W', ['outcomes', 'iqEPE'])}>filter_list</Icon>
                                    </Cell>
                                    {#if showTies.headTable.iq || showTies.headTable.iqEPE}
                                        <Cell class="header">
                                            IQ T
                                            <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.headToHeads, displayRecords.headToHeads.stats, 'T', ['outcomes', 'iq'])}>filter_list</Icon>
                                            <br>
                                            (EPE T)
                                            <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.headToHeads, displayRecords.headToHeads.stats, 'T', ['outcomes', 'iqEPE'])}>filter_list</Icon>
                                        </Cell>
                                    {/if}
                                    <Cell class="header">
                                        IQ L 
                                        <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.headToHeads, displayRecords.headToHeads.stats, 'L', ['outcomes', 'iq'])}>filter_list</Icon>
                                        <br>
                                        (EPE L)
                                        <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.headToHeads, displayRecords.headToHeads.stats, 'L', ['outcomes', 'iqEPE'])}>filter_list</Icon>
                                    </Cell>
                                    <Cell class="header">
                                        BestBall
                                        <br>
                                        Win %
                                        <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.headToHeads, displayRecords.headToHeads.stats, 'perc', ['outcomes', 'bball'])}>filter_list</Icon>
                                        <br>
                                        (EPE %)
                                        <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.headToHeads, displayRecords.headToHeads.stats, 'perc', ['outcomes', 'bballEPE'])}>filter_list</Icon>
                                    </Cell>
                                    <Cell class="header">
                                        BestBall W
                                        <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.headToHeads, displayRecords.headToHeads.stats, 'W', ['outcomes', 'bball'])}>filter_list</Icon>
                                        <br>
                                        (EPE W)
                                        <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.headToHeads, displayRecords.headToHeads.stats, 'W', ['outcomes', 'bballEPE'])}>filter_list</Icon>
                                    </Cell>
                                    {#if showTies.headTable.bball || showTies.headTable.bballEPE}
                                        <Cell class="header">
                                            BestBall T
                                            <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.headToHeads, displayRecords.headToHeads.stats, 'T', ['outcomes', 'bball'])}>filter_list</Icon>
                                            <br>
                                            (EPE T)
                                            <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.headToHeads, displayRecords.headToHeads.stats, 'T', ['outcomes', 'bballEPE'])}>filter_list</Icon>
                                        </Cell>
                                    {/if}
                                    <Cell class="header">
                                        BestBall L 
                                        <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.headToHeads, displayRecords.headToHeads.stats, 'L', ['outcomes', 'bball'])}>filter_list</Icon>
                                        <br>
                                        (EPE L)
                                        <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.headToHeads, displayRecords.headToHeads.stats, 'L', ['outcomes', 'bballEPE'])}>filter_list</Icon>
                                    </Cell>
                                    <Cell class="header">
                                        PF 
                                        <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.headToHeads, displayRecords.headToHeads.stats, 'real', ['fpts', 'starters'])}>filter_list</Icon>
                                        <br>
                                        (PPG)
                                        <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.headToHeads, displayRecords.headToHeads.stats, 'realPPG', ['fpts', 'starters'])}>filter_list</Icon></Cell>
                                    <Cell class="header">
                                        PA 
                                        <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.headToHeads, displayRecords.headToHeads.stats, 'real', ['fpts', 'opp'])}>filter_list</Icon>
                                        <br>
                                        (PPG)
                                        <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.headToHeads, displayRecords.headToHeads.stats, 'realPPG', ['fpts', 'opp'])}>filter_list</Icon>
                                    </Cell>
                                    <Cell class="header">
                                        Diff
                                        <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.headToHeads, displayRecords.headToHeads.stats, 'marg', ['margins', 'match'])}>filter_list</Icon>
                                        <br>
                                        (Diff PG)
                                        <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.headToHeads, displayRecords.headToHeads.stats, 'mpg', ['margins', 'match'])}>filter_list</Icon>
                                    </Cell>
                                </Row>
                            </Head>
                            <Body>
                                {#each displayRecords.headToHeads.stats as opponent, ix (rand * (ix + 1))}
                                    {#if rand == 0}
                                        nothing
                                    {:else}
                                        <Row>
                                            <Cell>{ix + 1}</Cell>
                                            <Cell class="cellName" on:click={() => gotoManager(opponent.oppRecordManID)}>
                                                {opponent.oppManager.realname}
                                                {#if masterSelection == 'yearly'}
                                                    <div class="fantasyTeamName">({opponent.oppManager.name})</div>
                                                {/if}
                                            </Cell>
                                            <Cell class="center">{round(opponent.outcomes.match.perc)} <div style="font-size: 0.9em">({round(opponent.outcomes.EPE.perc)})</div></Cell>
                                            <Cell class="center">{opponent.outcomes.match.W}  <div style="font-size: 0.9em">({opponent.outcomes.EPE.W})</div></Cell>
                                            {#if showTies.headTable.match || showTies.headTable.EPE}
                                                <Cell class="center">{opponent.outcomes.match.T}  <div style="font-size: 0.9em">({opponent.outcomes.EPE.T})</div></Cell>
                                            {/if}
                                            <Cell class="center">{opponent.outcomes.match.L}  <div style="font-size: 0.9em">({opponent.outcomes.EPE.L})</div></Cell>
                                            <Cell class="center">{round(opponent.outcomes.iq.perc)}  <div style="font-size: 0.9em">({round(opponent.outcomes.iqEPE.perc)})</div></Cell>
                                            <Cell class="center">{opponent.outcomes.iq.W}  <div style="font-size: 0.9em">({opponent.outcomes.iqEPE.W})</div></Cell>
                                            {#if showTies.headTable.iq || showTies.headTable.iqEPE}
                                                <Cell class="center">{opponent.outcomes.iq.T}  <div style="font-size: 0.9em">({opponent.outcomes.iqEPE.T})</div></Cell>
                                            {/if}
                                            <Cell class="center">{opponent.outcomes.iq.L}  <div style="font-size: 0.9em">({opponent.outcomes.iqEPE.L})</div></Cell>
                                            <Cell class="center">{round(opponent.outcomes.bball.perc)}  <div style="font-size: 0.9em">({round(opponent.outcomes.bballEPE.perc)})</div></Cell>
                                            <Cell class="center">{opponent.outcomes.bball.W}  <div style="font-size: 0.9em">({opponent.outcomes.bballEPE.W})</div></Cell>
                                            {#if showTies.headTable.bball || showTies.headTable.bballEPE}
                                                <Cell class="center">{opponent.outcomes.bball.T}  <div style="font-size: 0.9em">({opponent.outcomes.bballEPE.T})</div></Cell>
                                            {/if}
                                            <Cell class="center">{opponent.outcomes.iq.L}  <div style="font-size: 0.9em">({opponent.outcomes.iqEPE.L})</div></Cell>
                                            <Cell class="center">{round(opponent.fpts.starters.real)}  <div style="font-size: 0.9em">({round(opponent.fpts.starters.realPPG)})</div></Cell>
                                            <Cell class="center">{round(opponent.fpts.opp.real)}  <div style="font-size: 0.9em">({round(opponent.fpts.opp.realPPG)})</div></Cell>
                                            <Cell class="center">{round(opponent.margins.match.marg)}  <div style="font-size: 0.9em">({round(opponent.margins.match.mpg)})</div></Cell>
                                        </Row>
                                    {/if}
                                {/each}
                            </Body>
                        </DataTable>
                    {/if}
                    <div class="headToHeadWrap">
                        <div class="headToHeadChoices">
                            {#each managerChoicesLeft as manager}
                                <div class="columnWrap" style="width: 98%; align-items: flex-start;">
                                    <div class="headToHeadRow">
                                        {manager.info.realname}
                                        <br>
                                        {#if masterSelection == 'yearly'}
                                            <div class="fantasyTeamName" style="padding: 0 4%;">({manager.info.name})</div>
                                        {/if}
                                    </div>
                                </div>
                            {/each}
                        </div>
                        <div class="columnWrap" style="width: 58%;">
                            <div class="headToHeadMain">
                                <div class="columnWrap" style="border-right: 0.1em dashed var(--gcBox); border-bottom: 0.1em dashed var(--gcBox);">
                                    {#if displayManagerLeft}
                                        <div class="managerProfile">
                                            <img class="managerAvatar" src="{displayManagerLeft.info.avatar}" alt="">
                                            <div class="managerName">
                                                {displayManagerLeft.info.realname}
                                                {#if masterSelection == 'yearly'}
                                                    <div class="fantasyTeamName" style="display: inline-flex; position: relative;" >({displayManagerLeft.info.name})</div>
                                                {/if}
                                            </div>
                                        </div>
                                        <div class="headToHeadSummaryWrap">
                                            <div class="columnWrap">
                                                <div class="headToHeadSummaryHeader">
                                                    WINS
                                                </div>
                                                <div class="recordsWrap">
                                                    <div class="columnWrap">
                                                        <div class="headToHeadSummaryText">Match</div>
                                                        <div class="headToHeadSummaryText" style="background-color: #7a7a7a33;">EPE</div>
                                                        <div class="headToHeadSummaryText">IQ</div>
                                                        <div class="headToHeadSummaryText" style="background-color: #7a7a7a33;">EPE</div>
                                                        <div class="headToHeadSummaryText">BestBall</div>
                                                        <div class="headToHeadSummaryText" style="background-color: #7a7a7a33;">EPE</div>
                                                    </div>
                                                    <div class="columnWrap">
                                                        <div class="headToHeadSummaryText" style="justify-content: flex-end;">{displayManagerLeft.outcomes.match.W}</div>
                                                        <div class="headToHeadSummaryText" style="background-color: #7a7a7a33; justify-content: flex-end;">{displayManagerLeft.outcomes.EPE.W}</div>
                                                        <div class="headToHeadSummaryText" style="justify-content: flex-end;">{displayManagerLeft.outcomes.iq.W}</div>
                                                        <div class="headToHeadSummaryText" style="background-color: #7a7a7a33; justify-content: flex-end;">{displayManagerLeft.outcomes.iqEPE.W}</div>
                                                        <div class="headToHeadSummaryText" style="justify-content: flex-end;">{displayManagerLeft.outcomes.bball.W}</div>
                                                        <div class="headToHeadSummaryText" style="background-color: #7a7a7a33; justify-content: flex-end;">{displayManagerLeft.outcomes.bballEPE.W}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="columnWrap">
                                                <div class="headToHeadSummaryHeader">
                                                    POINTS
                                                </div>
                                                <div class="recordsWrap">
                                                    <div class="columnWrap">
                                                        <div class="headToHeadSummaryText">Match</div>
                                                        <div class="headToHeadSummaryText" style="background-color: #7a7a7a33;">PPG</div>
                                                        <div class="headToHeadSummaryText">Proj</div>
                                                        <div class="headToHeadSummaryText" style="background-color: #7a7a7a33;">PPG</div>
                                                        <div class="headToHeadSummaryText">Poss</div>
                                                        <div class="headToHeadSummaryText" style="background-color: #7a7a7a33;">PPG</div>
                                                    </div>
                                                    <div class="columnWrap">
                                                        <div class="headToHeadSummaryText" style="justify-content: flex-end;">{round(displayManagerLeft.fpts.starters.real)}</div>
                                                        <div class="headToHeadSummaryText" style="background-color: #7a7a7a33; justify-content: flex-end;">{round(displayManagerLeft.fpts.starters.realPPG)}</div>
                                                        <div class="headToHeadSummaryText" style="justify-content: flex-end;">{round(displayManagerLeft.fpts.starters.proj)}</div>
                                                        <div class="headToHeadSummaryText" style="background-color: #7a7a7a33; justify-content: flex-end;">{round(displayManagerLeft.fpts.starters.projPPG)}</div>
                                                        <div class="headToHeadSummaryText" style="justify-content: flex-end;">{round(displayManagerLeft.fpts.starters.poss)}</div>
                                                        <div class="headToHeadSummaryText" style="background-color: #7a7a7a33; justify-content: flex-end;">{round(displayManagerLeft.fpts.starters.possPPG)}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    {/if}
                                </div>
                                <div class="columnWrap" style="border-left: 0.1em dashed var(--gcBox); border-bottom: 0.1em dashed var(--gcBox);">
                                    {#if displayManagerRight}
                                        <div class="managerProfile">
                                            <img class="managerAvatar" src="{displayManagerRight.info.avatar}" alt="">
                                            <div class="managerName">
                                                {displayManagerRight.info.realname}
                                                {#if masterSelection == 'yearly'}
                                                    <div class="fantasyTeamName">({displayManagerRight.info.name})</div>
                                                {/if}
                                            </div>
                                        </div>
                                        <div class="headToHeadSummaryWrap">
                                            <div class="columnWrap">
                                                <div class="headToHeadSummaryHeader">
                                                    WINS
                                                </div>
                                                <div class="recordsWrap">
                                                    <div class="columnWrap">
                                                        <div class="headToHeadSummaryText">Match</div>
                                                        <div class="headToHeadSummaryText" style="background-color: #7a7a7a33;">EPE</div>
                                                        <div class="headToHeadSummaryText">IQ</div>
                                                        <div class="headToHeadSummaryText" style="background-color: #7a7a7a33;">EPE</div>
                                                        <div class="headToHeadSummaryText">BestBall</div>
                                                        <div class="headToHeadSummaryText" style="background-color: #7a7a7a33;">EPE</div>
                                                    </div>
                                                    <div class="columnWrap">
                                                        <div class="headToHeadSummaryText" style="justify-content: flex-end;">{displayManagerRight.outcomes.match.W}</div>
                                                        <div class="headToHeadSummaryText" style="background-color: #7a7a7a33; justify-content: flex-end;">{displayManagerRight.outcomes.EPE.W}</div>
                                                        <div class="headToHeadSummaryText" style="justify-content: flex-end;">{displayManagerRight.outcomes.iq.W}</div>
                                                        <div class="headToHeadSummaryText" style="background-color: #7a7a7a33; justify-content: flex-end;">{displayManagerRight.outcomes.iqEPE.W}</div>
                                                        <div class="headToHeadSummaryText" style="justify-content: flex-end;">{displayManagerRight.outcomes.bball.W}</div>
                                                        <div class="headToHeadSummaryText" style="background-color: #7a7a7a33; justify-content: flex-end;">{displayManagerRight.outcomes.bballEPE.W}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="columnWrap">
                                                <div class="headToHeadSummaryHeader">
                                                    POINTS
                                                </div>
                                                <div class="recordsWrap">
                                                    <div class="columnWrap">
                                                        <div class="headToHeadSummaryText">Match</div>
                                                        <div class="headToHeadSummaryText" style="background-color: #7a7a7a33;">PPG</div>
                                                        <div class="headToHeadSummaryText">Proj</div>
                                                        <div class="headToHeadSummaryText" style="background-color: #7a7a7a33;">PPG</div>
                                                        <div class="headToHeadSummaryText">Poss</div>
                                                        <div class="headToHeadSummaryText" style="background-color: #7a7a7a33;">PPG</div>
                                                    </div>
                                                    <div class="columnWrap">
                                                        <div class="headToHeadSummaryText" style="justify-content: flex-end;">{round(displayManagerRight.fpts.starters.real)}</div>
                                                        <div class="headToHeadSummaryText" style="background-color: #7a7a7a33; justify-content: flex-end;">{round(displayManagerRight.fpts.starters.realPPG)}</div>
                                                        <div class="headToHeadSummaryText" style="justify-content: flex-end;">{round(displayManagerRight.fpts.starters.proj)}</div>
                                                        <div class="headToHeadSummaryText" style="background-color: #7a7a7a33; justify-content: flex-end;">{round(displayManagerRight.fpts.starters.projPPG)}</div>
                                                        <div class="headToHeadSummaryText" style="justify-content: flex-end;">{round(displayManagerRight.fpts.starters.poss)}</div>
                                                        <div class="headToHeadSummaryText" style="background-color: #7a7a7a33; justify-content: flex-end;">{round(displayManagerRight.fpts.starters.possPPG)}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    {/if}
                                </div>
                            </div>
                            <div class="matchupSwitcher">
                                {#if displayManagerLeft && displayManagerRight && allMatchups.length > 0}
                                    {#if selectedMatchup > 0}
                                        <Icon class="material-icons changeMatchup" on:click={() => selectedMatchup = selectedMatchup - 1}>chevron_left</Icon>
                                    {:else}
                                        <span class="headToHeadSpacer" />
                                    {/if}  
                                    <div class="headToHeadHeadingText">{displayMatchup.home.year} - Week {displayMatchup.home.week}</div>
                                    {#if selectedMatchup < allMatchups.length - 1}
                                        <Icon class="material-icons changeMatchup" on:click={() => selectedMatchup = selectedMatchup + 1}>chevron_right</Icon>
                                    {:else}
                                        <span class="headToHeadSpacer" />
                                    {/if}  
                                {/if}
                            </div>
                            <div class="matchupWrap">
                                {#if displayManagerLeft && displayManagerRight}
                                    <div class="matchupHolder" style="margin-left: -{100 * selectedMatchup}%; width: {100 * allMatchups.length}%">
                                        {#each allMatchups as {home, away}}
                                            <div class="matchup">
                                                <LeagueMatchup {home} {away} />
                                            </div>
                                        {/each}
                                    </div>
                                {/if}
                            </div>
                        </div>
                        <div class="headToHeadChoices">
                            {#each managerChoicesRight as manager}
                                <div class="columnWrap" style="width: 98%; align-items: flex-end;">
                                    <div class="headToHeadRow" on:click={() => changeManager(manager.recordManID, headToHeadRecords)} style="align-items: flex-end; {displayManagerRight && displayManagerRight.info.realname == manager.info.realname ? "background-color: var(--gcSelect); border: 0.1em solid var(--g111);" : null}">
                                        {manager.info.realname}
                                        <br>
                                        {#if masterSelection == 'yearly'}
                                            <div class="fantasyTeamName" style="display: inline-flex; flex-direction: column; position: relative; align-items: flex-end; padding: 0 4%;" >({manager.info.name})</div>
                                        {/if}
                                    </div>
                                </div>
                            {/each}
                        </div>
                    </div>     
                {:else}
                    <div class="showEmpty">{emptyMessage}</div>
                {/if}   
            </div>
        </div>
    </div>
</div>