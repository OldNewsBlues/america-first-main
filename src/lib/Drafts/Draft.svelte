<script>
  	import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
	import LinearProgress from '@smui/linear-progress';
    import { onMount } from 'svelte';
    import DraftRow from './DraftRow.svelte';
    import { cleanName, gotoManager } from '$lib/utils/helper'
    
    export let draftData, previous = false, records, expanded;

    const {year, draft, draftOrder, draftType, reversalRound, leagueManagers, starterPositions, accuracy} = draftData;

    const getGrade = (score) => {
        
        let grade = 'N/A';

        if(score) {
            if(score > 90) {
                grade = score > 97 ? 'Aplus' : score > 93 ? 'A' : 'A-';
            } else if(score > 80) {
                grade = score > 87 ? 'Bplus' : score > 83 ? 'B' : 'B-';
            } else if(score > 70) {
                grade = score > 77 ? 'Cplus' : score > 73 ? 'C' : 'C-';
            } else if(score > 60) {
                grade = score > 67 ? 'Dplus' : score > 63 ? 'D' : 'D-';
            } else if(score > 50) {
                grade = score > 57 ? 'Fplus' : score > 53 ? 'F' : 'F-';
            } else if(score > 30) {
                grade = 'Y';
            } else if(score > 10) {
                grade = 'Z';
            } else {
                grade = 'β';
            }
        }
        
        return grade;
    }

    const classSize = draft[0].length;
    for(const round of draft) {
        for(const draftee of round) {
            const player = records.OVR.find(p => p.playerID == draftee.player.playerID);
            draftee.player.ovrRank = records.OVR.indexOf(player);
            draftee.player.posRank = records[draftee.player.position].indexOf(player);
            const ovrClass = draftee.player.ovrRank / classSize;
            const posClass = draftee.player.posRank / classSize;
            draftee.player.ovrClass = 'OVR-' + `${parseInt(ovrClass.toString().split('.')[0]) + 1}`;
            draftee.player.posClass = draftee.player.position + '-' + `${parseInt(posClass.toString().split('.')[0]) + 1}`;
        }
    }
    const draftGrades = {};
    const displayGrades = [];
    for(const rosterID in leagueManagers) {
        draftGrades[leagueManagers[rosterID].managerID] = {
            ovrScores: [],
            posAllScores: [],
            positions: [],
        }
        for(const round of draft) {
            const ownDraftees = round.filter(p => p.player.rosterID == rosterID);
            for(const draftee of ownDraftees) {
                if(!draftGrades[leagueManagers[rosterID].managerID].positions.find(g => g.pos == draftee.player.position)) {
                    draftGrades[leagueManagers[rosterID].managerID].positions.push({
                        pos: draftee.player.position,
                        scores: [],
                    })
                } 
                let totalAfterOvrPicks = round.filter(p => p.player.pick > draftee.player.pick).length;
                let totalAfterPosPicks = round.filter(p => p.player.position == draftee.player.position && p.player.pick > draftee.player.pick).length;
                let betterOvrPicks = round.filter(p => p.player.ovrRank < draftee.player.ovrRank && p.player.pick > draftee.player.pick).length;
                let betterPosPicks = round.filter(p => p.player.position == draftee.player.position && p.player.posRank < draftee.player.posRank && p.player.pick > draftee.player.pick).length;
                const remainingRounds = draft.slice(draft.indexOf(round) + 1);
                for(const remainingRound of remainingRounds) {
                    totalAfterOvrPicks += remainingRound.length;
                    totalAfterPosPicks += remainingRound.filter(p => p.player.position == draftee.player.position).length;
                    betterOvrPicks += remainingRound.filter(p => p.player.ovrRank < draftee.player.ovrRank).length;
                    betterPosPicks += remainingRound.filter(p => p.player.position == draftee.player.position && p.player.posRank < draftee.player.posRank).length;
                }
                const drafteeOvrScore = totalAfterOvrPicks == 0 ? 100 : (totalAfterOvrPicks - betterOvrPicks) / totalAfterOvrPicks * 100;
                const drafteePosScore = totalAfterPosPicks == 0 ? 100 : (totalAfterPosPicks - betterPosPicks) / totalAfterPosPicks * 100;
                draftee.player.ovrPickScore = drafteeOvrScore;
                draftee.player.posPickScore = drafteePosScore;
                draftee.player.ovrPickGrade = getGrade(drafteeOvrScore);
                draftee.player.posPickGrade = getGrade(drafteePosScore);
                draftGrades[leagueManagers[rosterID].managerID].ovrScores.push(drafteeOvrScore);
                draftGrades[leagueManagers[rosterID].managerID].positions.find(g => g.pos == draftee.player.position).scores.push(drafteePosScore);
            }
        }
        let scoresArray, numDraftees;
        for(const position of draftGrades[leagueManagers[rosterID].managerID].positions) {
            const denominator = starterPositions.filter(p => p == position.pos).length;
            position.scores.sort((a, b) => b - a);
            numDraftees = position.scores.length;
            if(numDraftees == 0) {
                position.posAvg = null;
            } else if(numDraftees == 1) {
                position.posAvg = position.scores[0];
            } else if(numDraftees == 2) {
                position.posAvg = denominator == 1 ? (position.scores[0] + (position.scores[1] / 2)) / 1.5 : (position.scores[0] + position.scores[1]) / 2.5;
            } else {
                scoresArray = position.scores.slice(0, denominator - 1);
                position.posAvg = position.scores.length > denominator ? (scoresArray.reduce((a, b) => a + b, 0) + (position.scores[denominator] / 2)) / (scoresArray.length + 0.5) : scoresArray.reduce((a, b) => a + b) / (scoresArray.length + 0.5);
            }
            draftGrades[leagueManagers[rosterID].managerID].posAllScores.push(position.posAvg);
            position.grade = getGrade(position.posAvg);
        }
        draftGrades[leagueManagers[rosterID].managerID].posAllAvg = draftGrades[leagueManagers[rosterID].managerID].posAllScores.reduce((a, b) => a + b, 0) / draftGrades[leagueManagers[rosterID].managerID].posAllScores.length;
        draftGrades[leagueManagers[rosterID].managerID].posAllGrade = getGrade(draftGrades[leagueManagers[rosterID].managerID].posAllAvg);

        numDraftees = draftGrades[leagueManagers[rosterID].managerID].ovrScores.length;
        if(numDraftees == 0) {
            draftGrades[leagueManagers[rosterID].managerID].ovrAvg = null;
        } else if(numDraftees == 1) {
            draftGrades[leagueManagers[rosterID].managerID].ovrAvg = draftGrades[leagueManagers[rosterID].managerID].ovrScores[0];
        } else if(numDraftees == 2) {
            draftGrades[leagueManagers[rosterID].managerID].ovrAvg = (draftGrades[leagueManagers[rosterID].managerID].ovrScores[0] + draftGrades[leagueManagers[rosterID].managerID].ovrScores[1]) / 2;
        } else {
            scoresArray = draftGrades[leagueManagers[rosterID].managerID].ovrScores.sort((a, b) => b - a).slice(numDraftees / 2 - 1, numDraftees / 2 + 1);
            draftGrades[leagueManagers[rosterID].managerID].ovrAvg = (scoresArray[0] + scoresArray[1]) / 2;
            draftGrades[leagueManagers[rosterID].managerID].ovrGrade = getGrade(draftGrades[leagueManagers[rosterID].managerID].ovrAvg);
        }

        draftGrades[leagueManagers[rosterID].managerID].avg = (draftGrades[leagueManagers[rosterID].managerID].ovrAvg + draftGrades[leagueManagers[rosterID].managerID].posAllAvg) / 2;
        draftGrades[leagueManagers[rosterID].managerID].grade = getGrade(draftGrades[leagueManagers[rosterID].managerID].avg);
        displayGrades[draftOrder.indexOf(parseInt(rosterID))] = draftGrades[leagueManagers[rosterID].managerID];
    }

    let progress = 0;
    let closed = false;

    onMount(loadAccuracy);

    function loadAccuracy() {
        if(!accuracy) return;
        let timer;
        progress = 0;
        closed = false;
        clearInterval(timer);
        timer = setInterval(() => {
            progress += 0.01;
            if (progress >= accuracy) {
                clearInterval(timer);
                if (progress >= 1) {
                    progress = 1;
                    closed = true;
                }
            }

        }, 100);
    }

</script>

<style>

    .accuracy {
        display: block;
        width: 80%;
        max-width: 800px;
        margin: 2em auto 3em;
    }

    .accuracyText {
        font-size: 0.7em;
        color: #666;
    }

    .disclaimer {
        font-style: italic;
        color: #888;
    }

    :global(.draftBoard) {
        display: block;
        width: 95%;
        margin: 2em auto 3em;
        overflow-x: auto;
    }

	:global(.draftTeam) {
        font-size: 0.8em;
		text-align: center;
		padding: 5px 0;
		background-color: var(--transactHeader);
        white-space: break-spaces;
        line-height: 1em;
        height: 5em;
        vertical-align: initial;
	}

	:global(.draftBoard table) {
        border-collapse: collapse;
        table-layout: fixed;
        width: 100%;
        min-width: 1200px;
	}

    :global(.draftBoard td) {
        border-right: 1px solid #ddd;
        height: 7em;
        font-size: 0.7em;
    }

    :global(.draftBoard td:last-of-type) {
        border-right: none;
    }

    :global(.draftGrade) {
        padding: 5px;
		background-color: var(--transactHeader);
        color: var(--gcPlayRowText);
        display: inline-flex;
        position: relative;
        flex-direction: column;
        height: 9em !important;
        width: 100%;
    }

    .draftGradeRow {
        display: inline-flex;
        position: relative;
        height: 4.5em !important;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        font-weight: 420;
    }

    .draftGradeContainer {
        display: inline-flex;
        position: relative;
        flex-direction: column;
        width: 50%;
        height: 100%;
        align-items: center;
        justify-content: center;
    }

	.avatar {
		border-radius: 50%;
        height: 30px;
        width: 30px;
        margin: 0.4em 0;
		border: 0.25px solid #777;
	}

    .clickable {
        cursor: pointer;
    }
	
	:global(.curDraftName) {
        color: #888;
        font-size: 0.7em;
        font-style: italic;
    }

    .Aplus {
        color: #00ec04;
    }

    .A {
        color: #32d600;
    }

    .A- {
        color: #2eab00;
    }

    .Bplus {
        color: #48b400;
    }

    .B {
        color: #3b8800;
    }

    .B- {
        color: #618800;
    }

    .Cplus {
        color: #888600;
    }

    .C {
        color: #9a8600;
    }

    .C- {
        color: #a6a300;
    }

    .Dplus {
        color: #a69500;
    }

    .D {
        color: #b69400;
    }

    .D- {
        color: #b68600;
    }

    .Fplus {
        color: #b66100;
    }

    .F {
        color: #b64300;
    }

    .F- {
        color: #b60f00;
    }

    .Y {
        color: #0036cb;
    }

    .Z {
        color: #5800cb;
    }

    .β {
        color: #c400cb;
    }
</style>

{#if accuracy  && !closed}
    <div class="accuracy">
        <div class="accuracyText">
            Upcomig draft order accuracy: {parseInt(progress*100)}%
            <span class="disclaimer">(accuracy will improve as the regular season progresses)</span>
        </div>
        <LinearProgress {progress} {closed} />
    </div>
{/if}

<DataTable class="draftBoard">
    <Head>
        <Row>
            {#each draftOrder as draftPosition}
                {#if draftPosition}
                    <Cell class="draftTeam">
                        <img class="avatar clickable" on:click={() => gotoManager(leagueManagers[draftPosition].managerID)} src="{leagueManagers[draftPosition].avatar}" alt="{leagueManagers[draftPosition].name} avatar"/>
                        <br />
                        <span class="clickable" on:click={() => gotoManager(leagueManagers[draftPosition].managerID)}>{leagueManagers[draftPosition].name}{@html leagueManagers && cleanName(leagueManagers[draftPosition].name) != cleanName(leagueManagers[draftPosition].name) ? `<br /><span class="curDraftName">(${leagueManagers[draftPosition].name})</span>` : ''}</span>
                    </Cell>
                {/if}
            {/each}
        </Row>
    </Head>
    <Body>
        {#each draft as draftRow, row}
            <DraftRow {draftRow} row={row + 1} {previous} {reversalRound} {draftType} {expanded} />
        {/each}
        <Row>
            {#if displayGrades.length > 0}
                {#each displayGrades as manager}
                    <Cell class="draftGrade">
                        <div class="draftGradeRow">
                            <div class="draftGradeContainer" style="font-size: 3em; width: 50%;">
                                <div class="{manager.grade}">{manager.grade.includes('plus') ? manager.grade.slice(0, 1) + '+' : manager.grade}</div>
                            </div>
                            <div style="display:inline-flex; font-size: 1.5em; width: 50%;">
                                <div class="draftGradeContainer" style="width: 65%;">
                                    <div>OVR:</div>
                                    <div>POS:</div>
                                </div>
                                <div class="draftGradeContainer" style="width: 35%;">
                                    <div class="{manager.ovrGrade}">{manager.ovrGrade.includes('plus') ? manager.ovrGrade.slice(0, 1) + '+' : manager.ovrGrade}</div>
                                    <div class="{manager.posAllGrade}">{manager.posAllGrade.includes('plus') ? manager.posAllGrade.slice(0, 1) + '+' : manager.posAllGrade}</div>
                                </div> 
                            </div>
                        </div>
                        <div class="draftGradeRow" style="line-height: 1em;">
                            {#each manager.positions as position}
                                <div style="margin: 0 4px; font-size: 0.9em;">
                                    <div class="draftGradeContainer" style="width: auto;">
                                        {position.pos}:
                                        <div class="{position.grade}">{position.grade.includes('plus') ? position.grade.slice(0, 1) + '+' : position.grade}</div>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    </Cell>
                {/each}
            {/if}
        </Row>
    </Body>
</DataTable>

