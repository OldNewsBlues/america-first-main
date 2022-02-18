<script>
    import { getLeagueRecords } from '$lib/utils/helper'; 
    import Button, { Group, Label } from '@smui/button';
    import AllTimeRecords from './AllTimeRecords.svelte';
    import PerSeasonRecords from './PerSeasonRecords.svelte';

    export let leagueRecords;

    let masterSelection = 'alltime';
    let displayType;
    const changeMasterSelection = (newMaster) => {
        displayType = newMaster;
        return displayType;
    }
    $: displayType = changeMasterSelection(masterSelection);

    let { allManagers, currentYear, lastYear, headToHeadRecords, rosterPositions, recordArrays } = leagueRecords;

    const refreshRecords = async () => {
        const newRecords = await getLeagueRecords(true);

        // update values with new data
        leagueRecords = newRecords;
        allManagers = newRecords.allManagers;
        currentYear = newRecords.currentYear;
        lastYear = newRecords.lastYear;
        headToHeadRecords = newRecords.headToHeadRecords;
        rosterPositions = newRecords.rosterPositions;
        recordArrays = newRecords.recordArrays;
    }

    if(leagueRecords.stale) refreshRecords();

    let displayRecords = {
        weekHighs: {
            stats: recordArrays.league.alltime.regular.weekHighs,
            sort: 'real',
            path: ['fpts', 'starters'],
            inverted: false,
        },
        weekLows: {
            stats: recordArrays.league.alltime.regular.weekLows,
            sort: 'real',
            path: ['fpts', 'starters'],
            inverted: false,
        },
        periodHighs: {
            stats: recordArrays.league.alltime.regular.periodHighs,
            sort: 'realPPG',
            path: ['fpts', 'starters'],
            inverted: false,
        },
        periodLows: {
            stats: recordArrays.league.alltime.regular.periodLows,
            sort: 'realPPG',
            path: ['fpts', 'starters'],
            inverted: false,
        },
        biggestBlowouts: {
            stats: recordArrays.league.alltime.regular.biggestBlowouts,
            sort: 'matchDifferential',
            path: [],
            inverted: false,
        },
        narrowestVictories: {
            stats: recordArrays.league.alltime.regular.narrowestVictories,
            sort: 'matchDifferential',
            path: [],
            inverted: false,
        },
        managerBests: {
            winRecords: {
                stats: recordArrays.league.alltime.regular.managerBests.winRecords,
                sort: 'perc',
                path: ['outcomes', 'match'],
                inverted: false,
            },
            projRecords: {
                stats: recordArrays.league.alltime.regular.managerBests.projRecords,
                sort: 'proj',
                path: ['fpts', 'starters'],
                inverted: false,
            },
            lineupIqs: {
                stats: recordArrays.league.alltime.regular.managerBests.lineupIqs,
                sort: 'iq',
                path: [],
                inverted: false,
            },
            fptsPoss: {
                stats: recordArrays.league.alltime.regular.managerBests.fptsPoss,
                sort: 'poss',
                path: ['fpts', 'starters'],
                inverted: false,
            },
            fptsHistories: {
                stats: recordArrays.league.alltime.regular.managerBests.fptsHistories,
                sort: 'real',
                path: ['fpts', 'starters'],
                inverted: false,
            },
            medianRecords: {
                stats: recordArrays.league.alltime.regular.managerBests.medianRecords,
                sort: 'perc',
                path: ['outcomes', 'median'],
                inverted: false,
            },
            epeRecords: {
                stats: recordArrays.league.alltime.regular.managerBests.epeRecords,
                sort: 'perc',
                path: ['outcomes', 'EPE'],
                inverted: false,
            },
            bestBalls: {
                stats: recordArrays.league.alltime.regular.managerBests.bestBalls,
                sort: 'perc',
                path: ['outcomes', 'bball'],
                inverted: false,
            },
            periodHighs: {
                stats: recordArrays.league.alltime.regular.managerBests.periodHighs,
                sort: 'realPPG',
                path: ['fpts', 'starters'],
                inverted: false,
            },
            periodLows: {
                stats: recordArrays.league.alltime.regular.managerBests.periodLows,
                sort: 'realPPG',
                path: ['fpts', 'starters'],
                inverted: false,
            },
            weekHighs: {
                stats: recordArrays.league.alltime.regular.managerBests.weekHighs,
                sort: 'real',
                path: ['fpts', 'starters'],
                inverted: false,
            },
            weekLows: {
                stats: recordArrays.league.alltime.regular.managerBests.weekLows,
                sort: 'real',
                path: ['fpts', 'starters'],
                inverted: false,
            },
            blowoutBests: {
                stats: recordArrays.league.alltime.regular.managerBests.blowoutBests,
                sort: 'matchDifferential',
                path: [],
                inverted: false,
            },
            blowoutWorsts: {
                stats: recordArrays.league.alltime.regular.managerBests.blowoutWorsts,
                sort: 'matchDifferential',
                path: [],
                inverted: true,
            },
            narrowBests: {
                stats: recordArrays.league.alltime.regular.managerBests.narrowBests,
                sort: 'matchDifferential',
                path: [],
                inverted: true,
            },
            narrowWorsts: {
                stats: recordArrays.league.alltime.regular.managerBests.narrowWorsts,
                sort: 'matchDifferential',
                path: [],
                inverted: false,
            },
        },
        players: {
            periodHighs: {
                stats: recordArrays.league.alltime.regular.players.periodHighs,
                sort: 'real',
                path: ['fpts', 'starters'],
                inverted: false,
            },
            weekHighs: {
                stats: recordArrays.league.alltime.regular.players.weekHighs,
                sort: 'fpts',
                path: [],
                inverted: false,
            },
            weekMissedHighs: {
                stats: recordArrays.league.alltime.regular.players.weekMissedHighs,
                sort: 'fpts',
                path: [],
                inverted: false,
            },
            overallMissedHighs: {
                stats: recordArrays.league.alltime.regular.players.overallMissedHighs,
                sort: 'real',
                path: ['fpts', 'bench'],
                inverted: false,
            },
            gamesHighs: {
                stats: recordArrays.league.alltime.regular.players.gamesHighs,
                sort: 'starters',
                path: ['weeks'],
                inverted: false,
            },
            overallHighs: {
                stats: recordArrays.league.alltime.regular.players.overallHighs,
                sort: 'real',
                path: ['fpts', 'starters'],
                inverted: false,
            },
            weekOvers: {
                stats: recordArrays.league.alltime.regular.players.weekOvers,
                sort: 'projDiff',
                path: [],
                inverted: false,
            },
            weekUnders: {
                stats: recordArrays.league.alltime.regular.players.weekUnders,
                sort: 'projDiff',
                path: [],
                inverted: true,
            },
            seasonOvers: {
                stats: recordArrays.league.alltime.regular.players.seasonOvers,
                sort: 'diff',
                path: ['fpts', 'starters'],
                inverted: false,
            },
            seasonUnders: {
                stats: recordArrays.league.alltime.regular.players.seasonUnders,
                sort: 'diff',
                path: ['fpts', 'starters'],
                inverted: true,
            },
            managerBests: {
                periodHighs: {
                    stats: recordArrays.league.alltime.regular.players.managerBests.periodHighs,
                    sort: 'real',
                    path: ['fpts', 'starters'],
                    inverted: false,
                },
                weekHighs: {
                    stats: recordArrays.league.alltime.regular.players.managerBests.weekHighs,
                    sort: 'fpts',
                    path: [],
                    inverted: false,
                },
                weekMissedHighs: {
                    stats: recordArrays.league.alltime.regular.players.managerBests.weekMissedHighs,
                    sort: 'fpts',
                    path: [],
                    inverted: false,
                },
                overallMissedHighs: {
                    stats: recordArrays.league.alltime.regular.players.managerBests.overallMissedHighs,
                    sort: 'real',
                    path: ['fpts', 'bench'],
                    inverted: false,
                },
                gamesHighs: {
                    stats: recordArrays.league.alltime.regular.players.managerBests.gamesHighs,
                    sort: 'starters',
                    path: ['weeks'],
                    inverted: false,
                },
                overallHighs: {
                    stats: recordArrays.league.alltime.regular.players.managerBests.overallHighs,
                    sort: 'real',
                    path: ['fpts', 'starters'],
                    inverted: false,
                },
                weekOvers: {
                    stats: recordArrays.league.alltime.regular.players.managerBests.weekOvers,
                    sort: 'projDiff',
                    path: [],
                    inverted: false,
                },
                weekUnders: {
                    stats: recordArrays.league.alltime.regular.players.managerBests.weekUnders,
                    sort: 'projDiff',
                    path: [],
                    inverted: true,
                },
                seasonOvers: {
                    stats: recordArrays.league.alltime.regular.players.managerBests.seasonOvers,
                    sort: 'diff',
                    path: ['fpts', 'starters'],
                    inverted: false,
                },
                seasonUnders: {
                    stats: recordArrays.league.alltime.regular.players.managerBests.seasonUnders,
                    sort: 'diff',
                    path: ['fpts', 'starters'],
                    inverted: true,
                },
            }
        },
        positions: {},
        acquisitions: {},
        transactions: {},
    }
    for(const key in recordArrays.league.alltime.regular.transactions) {
        displayRecords.transactions[key] = {
            stats: recordArrays.league.alltime.regular.transactions[key],
            sort: `${key}`,
            path: [],
            inverted: false,
        }
    }
    for(const position in recordArrays.league.alltime.regular.positions.leagueAverages) {
        displayRecords.positions[position] = {
            leagueAverages: {
                managerAverages: {
                    stats: recordArrays.league.alltime.regular.positions.leagueAverages[position].managerAverages,
                    sort: 'realPPG',
                    path: [],
                    inverted: false,
                },
            },
            managerBests: {
                periodHighs: {
                    stats: recordArrays.league.alltime.regular.positions[position].managerBests.periodHighs,
                    sort: 'real',
                    path: ['fpts', 'starters'],
                    inverted: false,
                },
                weekHighs: {
                    stats: recordArrays.league.alltime.regular.positions[position].managerBests.weekHighs,
                    sort: 'fpts',
                    path: [],
                    inverted: false,
                },
                weekMissedHighs: {
                    stats: recordArrays.league.alltime.regular.positions[position].managerBests.weekMissedHighs,
                    sort: 'fpts',
                    path: [],
                    inverted: false,
                },
                overallMissedHighs: {
                    stats: recordArrays.league.alltime.regular.positions[position].managerBests.overallMissedHighs,
                    sort: 'real',
                    path: ['fpts', 'bench'],
                    inverted: false,
                },
                gamesHighs: {
                    stats: recordArrays.league.alltime.regular.positions[position].managerBests.gamesHighs,
                    sort: 'starters',
                    path: ['weeks'],
                    inverted: false,
                },
                overallHighs: {
                    stats: recordArrays.league.alltime.regular.positions[position].managerBests.overallHighs,
                    sort: 'real',
                    path: ['fpts', 'starters'],
                    inverted: false,
                },
                weekOvers: {
                    stats: recordArrays.league.alltime.regular.positions[position].managerBests.weekOvers,
                    sort: 'projDiff',
                    path: [],
                    inverted: false,
                },
                weekUnders: {
                    stats: recordArrays.league.alltime.regular.positions[position].managerBests.weekUnders,
                    sort: 'projDiff',
                    path: [],
                    inverted: true,
                },
                seasonOvers: {
                    stats: recordArrays.league.alltime.regular.positions[position].managerBests.seasonOvers,
                    sort: 'diff',
                    path: ['fpts', 'starters'],
                    inverted: false,
                },
                seasonUnders: {
                    stats: recordArrays.league.alltime.regular.positions[position].managerBests.seasonUnders,
                    sort: 'diff',
                    path: ['fpts', 'starters'],
                    inverted: true,
                },
            },
            periodHighs: {
                stats: recordArrays.league.alltime.regular.positions[position].periodHighs,
                sort: 'real',
                path: ['fpts', 'starters'],
                inverted: false,
            },
            weekHighs: {
                stats: recordArrays.league.alltime.regular.positions[position].weekHighs,
                sort: 'fpts',
                path: [],
                inverted: false,
            },
            weekMissedHighs: {
                stats: recordArrays.league.alltime.regular.positions[position].weekMissedHighs,
                sort: 'fpts',
                path: [],
                inverted: false,
            },
            overallMissedHighs: {
                stats: recordArrays.league.alltime.regular.positions[position].overallMissedHighs,
                sort: 'real',
                path: ['fpts', 'bench'],
                inverted: false,
            },
            gamesHighs: {
                stats: recordArrays.league.alltime.regular.positions[position].gamesHighs,
                sort: 'starters',
                path: ['weeks'],
                inverted: false,
            },
            overallHighs: {
                stats: recordArrays.league.alltime.regular.positions[position].overallHighs,
                sort: 'real',
                path: ['fpts', 'starters'],
                inverted: false,
            },
            weekOvers: {
                stats: recordArrays.league.alltime.regular.positions[position].weekOvers,
                sort: 'projDiff',
                path: [],
                inverted: false,
            },
            weekUnders: {
                stats: recordArrays.league.alltime.regular.positions[position].weekUnders,
                sort: 'projDiff',
                path: [],
                inverted: true,
            },
            seasonOvers: {
                stats: recordArrays.league.alltime.regular.positions[position].seasonOvers,
                sort: 'diff',
                path: ['fpts', 'starters'],
                inverted: false,
            },
            seasonUnders: {
                stats: recordArrays.league.alltime.regular.positions[position].seasonUnders,
                sort: 'diff',
                path: ['fpts', 'starters'],
                inverted: true,
            },
        }
    }
    for(const transType in recordArrays.league.alltime.regular.acquisitions.leagueAverages) {
        displayRecords.acquisitions[transType] = {
            leagueAverages: {
                managerAverages: {
                    stats: [],
                    sort: 'realPPG',
                    path: [],
                    inverted: false,
                },
            },
            managerBests: {
                periodHighs: {
                    stats: recordArrays.league.alltime.regular.acquisitions[transType].managerBests.periodHighs,
                    sort: 'real',
                    path: ['fpts', 'trans', transType, 'starters'],
                    inverted: false,
                },
                weekHighs: {
                    stats: recordArrays.league.alltime.regular.acquisitions[transType].managerBests.weekHighs,
                    sort: 'fpts',
                    path: [],
                    inverted: false,
                },
                weekMissedHighs: {
                    stats: recordArrays.league.alltime.regular.acquisitions[transType].managerBests.weekMissedHighs,
                    sort: 'fpts',
                    path: [],
                    inverted: false,
                },
                overallMissedHighs: {
                    stats: recordArrays.league.alltime.regular.acquisitions[transType].managerBests.overallMissedHighs,
                    sort: 'real',
                    path: ['fpts', 'trans', transType, 'bench'],
                    inverted: false,
                },
                gamesHighs: {
                    stats: recordArrays.league.alltime.regular.acquisitions[transType].managerBests.gamesHighs,
                    sort: 'weeks',
                    path: ['fpts', 'trans', transType, 'starters'],
                    inverted: false,
                },
                overallHighs: {
                    stats: recordArrays.league.alltime.regular.acquisitions[transType].managerBests.overallHighs,
                    sort: 'real',
                    path: ['fpts', 'trans', transType, 'starters'],
                    inverted: false,
                },  
                weekOvers: {
                    stats: recordArrays.league.alltime.regular.acquisitions[transType].managerBests.weekOvers,
                    sort: 'projDiff',
                    path: [],
                    inverted: false,
                },
                weekUnders: {
                    stats: recordArrays.league.alltime.regular.acquisitions[transType].managerBests.weekUnders,
                    sort: 'projDiff',
                    path: [],
                    inverted: true,
                },
                seasonOvers: {
                    stats: recordArrays.league.alltime.regular.acquisitions[transType].managerBests.seasonOvers,
                    sort: 'diff',
                    path: ['fpts', 'trans', transType, 'starters'],
                    inverted: false,
                },
                seasonUnders: {
                    stats: recordArrays.league.alltime.regular.acquisitions[transType].managerBests.seasonUnders,
                    sort: 'diff',
                    path: ['fpts', 'trans', transType, 'starters'],
                    inverted: true,
                },
            },
            periodHighs: {
                stats: recordArrays.league.alltime.regular.acquisitions[transType].periodHighs,
                sort: 'real',
                path: ['fpts', 'trans', transType, 'starters'],
                inverted: false,
            },
            weekHighs: {
                stats: recordArrays.league.alltime.regular.acquisitions[transType].weekHighs,
                sort: 'fpts',
                path: [],
                inverted: false,
            },
            weekMissedHighs: {
                stats: recordArrays.league.alltime.regular.acquisitions[transType].weekMissedHighs,
                sort: 'fpts',
                path: [],
                inverted: false,
            },
            overallMissedHighs: {
                stats: recordArrays.league.alltime.regular.acquisitions[transType].overallMissedHighs,
                sort: 'real',
                path: ['fpts', 'trans', transType, 'bench'],
                inverted: false,
            },
            gamesHighs: {
                stats: recordArrays.league.alltime.regular.acquisitions[transType].gamesHighs,
                sort: 'weeks',
                path: ['fpts', 'trans', transType, 'starters'],
                inverted: false,
            },
            overallHighs: {
                stats: recordArrays.league.alltime.regular.acquisitions[transType].overallHighs,
                sort: 'real',
                path: ['fpts', 'trans', transType, 'starters'],
                inverted: false,
            },
            weekOvers: {
                stats: recordArrays.league.alltime.regular.acquisitions[transType].weekOvers,
                sort: 'projDiff',
                path: [],
                inverted: false,
            },
            weekUnders: {
                stats: recordArrays.league.alltime.regular.acquisitions[transType].weekUnders,
                sort: 'projDiff',
                path: [],
                inverted: true,
            },
            seasonOvers: {
                stats: recordArrays.league.alltime.regular.acquisitions[transType].seasonOvers,
                sort: 'diff',
                path: ['fpts', 'trans', transType, 'starters'],
                inverted: false,
            },
            seasonUnders: {
                stats: recordArrays.league.alltime.regular.acquisitions[transType].seasonUnders,
                sort: 'diff',
                path: ['fpts', 'trans', transType, 'starters'],
                inverted: true,
            },
        }
    }

</script>

<style>

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

    .empty {
        margin: 10em 0 4em;
        text-align: center;
    }

    .buttonHolder {
        text-align: center;
        margin: 2em 0;
        width: 100%;
    }
</style>

<div class="rankingsWrapper">
    <div class="mainBase">
        <div class="buttonHolder">
            <Group variant="outlined">
                <Button class="selectionButtons" on:click={() => changeMasterSelection('alltime')} variant="{displayType == 'alltime' ? "raised" : "outlined"}">
                    <Label>All-Time</Label>
                </Button>
                <Button class="selectionButtons" on:click={() => changeMasterSelection('yearly')} variant="{displayType == 'yearly' ? "raised" : "outlined"}">
                    <Label>Yearly</Label>
                </Button>
            </Group>
        </div>

        {#if displayType == 'alltime'}
            {#if recordArrays.league}
                <AllTimeRecords {recordArrays} {allManagers} {headToHeadRecords} {displayRecords} positions={rosterPositions.alltime} />
            {:else}
                <p class="empty">No records <i>yet</i>...</p>
            {/if}
        {:else if displayType == 'yearly'}
            <PerSeasonRecords {recordArrays} {allManagers} {currentYear} {lastYear} {headToHeadRecords} {displayRecords} rosterPositions={rosterPositions.years} />
        {/if}
    </div>
</div>
