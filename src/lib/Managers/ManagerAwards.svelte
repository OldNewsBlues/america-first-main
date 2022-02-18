<script>
    import { round, capitalizeFirstLetter } from "$lib/utils/helper";

    export let awards, records, roster, recordManID;

    let displayAwards = [];
    
    const computePodiums = (currentRoster) => {
        displayAwards = [];

        // first look through annual awards (champion, second, etc)
        for(const podium of awards.podiums) {
            for(const award in podium) {
                if(award == 'champRosters') continue;

                if(podium[award]?.recordManID == recordManID) {
                    displayAwards.push({
                        award: capitalizeFirstLetter(award),
                        icon: '/awards/' + award + '.png',
                        type: 'award',
                        originalName: podium[award].name,
                        year: podium.year,
                    })
                }
                if(award == 'divisions') {
                    for(const division of podium[award]) {
                        if(division.recordManID == recordManID) {
                            let awardTitle = 'Regular Season Champion';
                            if(division.name) {
                                awardTitle = `${division.name} Division Champion`;
                            }
                            displayAwards.push({
                                award: awardTitle,
                                icon: '/awards/division.png',
                                type: 'award',
                                originalName: division.manager.name,
                                year: podium.year,
                            })
                        }
                    }
                }
            }
        }

        // Next look through record books
        const leagueRosterRecords = {};
        for(const key in records.recordArrays.league.alltime.combined) {
            if(key != 'narrowestVictories' && key != 'weekHighs' && key != 'periodHighs' && key != 'biggestBlowouts') continue;
            if(records.recordArrays.league.alltime.combined[key].find(m => m.recordManID == recordManID) && records.recordArrays.league.alltime.combined[key].indexOf(records.recordArrays.league.alltime.combined[key].find(m => m.recordManID == recordManID)) < 5) leagueRosterRecords[key] = records.recordArrays.league.alltime.combined[key];
        }
        for(const key in leagueRosterRecords) {
            const recordMan = leagueRosterRecords[key].find(m => m.recordManID == recordManID);
            if(key == 'weekHighs') {
                displayAwards.push({
                    award: leagueRosterRecords[key].indexOf(recordMan) + 1,
                    icon: '/awards/' + (leagueRosterRecords[key].indexOf(recordMan) < 3 ? `record-${leagueRosterRecords[key].indexOf(recordMan)+1}` : 'generic') + '.png',
                    type: 'All-Time Single-Week Record',
                    originalName: recordMan.manager.name,
                    year: recordMan.year,
                    week: recordMan.week,
                    extraInfo: round(recordMan.fpts.starters.real),
                    pts: true,
                })
            } else if(key == 'periodHighs') {
                displayAwards.push({
                    award: leagueRosterRecords[key].indexOf(recordMan) + 1,
                    icon: '/awards/' + (leagueRosterRecords[key].indexOf(recordMan) < 3 ? `record-${leagueRosterRecords[key].indexOf(recordMan)+1}` : 'generic') + '.png',
                    type: 'All-Time Season Long Points',
                    originalName: recordMan.manager.name,
                    year: recordMan.year,
                    extraInfo: round(recordMan.fpts.starters.realPPG),
                    pts: true,
                })
            } else if(key == 'biggestBlowouts') {
                displayAwards.push({
                    award: leagueRosterRecords[key].indexOf(recordMan) + 1,
                    icon: '/awards/' + (leagueRosterRecords[key].indexOf(recordMan) < 3 ? `record-${leagueRosterRecords[key].indexOf(recordMan)+1}` : 'generic') + '.png',
                    type: 'All-Time Biggest Blowouts',
                    originalName: recordMan.manager.name,
                    year: recordMan.year,
                    week: recordMan.week,
                    extraInfo: round(recordMan.matchDifferential),
                    margin: true,
                })
            } else if(key == 'narrowestVictories') {
                displayAwards.push({
                    award: leagueRosterRecords[key].indexOf(recordMan) + 1,
                    icon: '/awards/' + (leagueRosterRecords[key].indexOf(recordMan) < 3 ? `record-${leagueRosterRecords[key].indexOf(recordMan)+1}` : 'generic') + '.png',
                    type: 'All-Time Narrowest Victories',
                    originalName: recordMan.manager.name,
                    year: recordMan.year,
                    week: recordMan.week,
                    extraInfo: round(recordMan.matchDifferential),
                    margin: true,
                })
            }
        }
        const leagueManagerRecords = {
            winRecords: records.recordArrays.league.alltime.combined.managerBests.winRecords,
            pointsRecords: records.recordArrays.league.alltime.combined.managerBests.fptsHistories,
            iqRecords: records.recordArrays.league.alltime.combined.managerBests.lineupIqs,
            epeRecords: records.recordArrays.league.alltime.combined.managerBests.epeRecords,
            medianRecords: records.recordArrays.league.alltime.combined.managerBests.medianRecords,
        }
        for(const key in leagueManagerRecords) {
            const recordMan = leagueManagerRecords[key].find(m => m.recordManID == recordManID);
            if(!recordMan) continue;
            if(key == 'winRecords' && leagueManagerRecords[key].indexOf(recordMan) < 5) {
                displayAwards.push({
                    award: leagueManagerRecords[key].indexOf(recordMan) + 1,
                    icon: '/awards/' + (leagueManagerRecords[key].indexOf(recordMan) < 3 ? `record-${leagueManagerRecords[key].indexOf(recordMan)+1}` : 'generic') + '.png',
                    type: 'All-Time Highest Win %',
                    originalName: recordMan.manager.name,
                    extraInfo: round(recordMan.outcomes.match.perc),
                    wins: true,
                })
            } else if(key == 'pointsRecords' && leagueManagerRecords[key].indexOf(recordMan) < 5) {
                displayAwards.push({
                    award: leagueManagerRecords[key].indexOf(recordMan) + 1,
                    icon: '/awards/' + (leagueManagerRecords[key].indexOf(recordMan) < 3 ? `record-${leagueManagerRecords[key].indexOf(recordMan)+1}` : 'generic') + '.png',
                    type: 'All-Time Highest PPG',
                    originalName: recordMan.manager.name,
                    extraInfo: round(recordMan.fpts.starters.realPPG),
                    pts: true,
                })
            } else if(key == 'iqRecords' && leagueManagerRecords[key].indexOf(recordMan) < 5) {
                displayAwards.push({
                    award: leagueManagerRecords[key].indexOf(recordMan) + 1,
                    icon: '/awards/' + (leagueManagerRecords[key].indexOf(recordMan) < 3 ? `record-${leagueManagerRecords[key].indexOf(recordMan)+1}` : 'generic') + '.png',
                    type: 'All-Time Highest Lineup IQ',
                    originalName: recordMan.manager.name,
                    extraInfo: round(recordMan.iq),
                    iq: true,
                })
            } else if(key == 'epeRecords' && leagueManagerRecords[key].indexOf(recordMan) < 5) {
                displayAwards.push({
                    award: leagueManagerRecords[key].indexOf(recordMan) + 1,
                    icon: '/awards/' + (leagueManagerRecords[key].indexOf(recordMan) < 3 ? `record-${leagueManagerRecords[key].indexOf(recordMan)+1}` : 'generic') + '.png',
                    type: 'All-Time Highest EPE Win %',
                    originalName: recordMan.manager.name,
                    extraInfo: round(recordMan.outcomes.EPE.perc),
                    wins: true,
                })
            } else if(key == 'medianRecords' && leagueManagerRecords[key].indexOf(recordMan) < 5) {
                displayAwards.push({
                    award: leagueManagerRecords[key].indexOf(recordMan) + 1,
                    icon: '/awards/' + (leagueManagerRecords[key].indexOf(recordMan) < 3 ? `record-${leagueManagerRecords[key].indexOf(recordMan)+1}` : 'generic') + '.png',
                    type: 'All-Time Highest Median Win %',
                    originalName: recordMan.manager.name,
                    extraInfo: round(recordMan.outcomes.median.perc),
                    wins: true,
                })
            } 
        }
    }

    $: computePodiums(roster);

    const computeAward = (award) => {
        switch (award) {
            case 1:
                return '1st Place'
            case 2:
                return '2nd Place'
            case 3:
                return '3rd Place'
            case 4:
            case 5:
                return award + 'th Place';
            case 'Champion':
                return award
            case 'Second':
            case 'Third':
                return award + ' Place'
            case 'Toilet':
                return award + ' Bowl'
            default:
                return award;
        }
    }
</script>

<style>
    .awardsCase {
        background-color: var(--fff);
        padding: 0 0 2em;
        margin: 1.5em 0;
        border-bottom: 1px solid var(--aaa);
        border-top: 1px solid var(--aaa);
        box-shadow: 0 0 8px 4px var(--ccc);
    }

    .awardsCaseInner {
        display: flex;
        justify-content: space-evenly;
        flex-wrap: wrap;
    }

    h3 {
        text-align: center;
        font-size: 1.5em;
        margin: 1.5em 0 0.5em;
        font-weight: 200;
    }

    .award {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        margin: 1em 0.5em 2em;
    }

    .awardHeader, .awardLabel, .subText {
        text-align: center;
        line-height: 1.2em;
    }

    .awardHeader {
        height: 2.4em;
        font-size: 0.85em;
        width: 110px;
        margin-bottom: 0.5em;
    }

    .awardLabel {
        font-size: 0.9em;
        margin-top: 1em;
        font-weight: 500;
        width: 130px;
    }

    .subText {
        font-size: 0.8em;
        width: 130px;
        color: var(--g555);
        margin-top: 0.3em;
        font-style: italic;
    }

    .sad {
        color: var(--g999);
        font-style: italic;
    }

    .awardIcon {
        height: 80px;
        width: 80px;
        border-radius: 100%;
        box-shadow: 0 0 4px 1px var(--ccc);
        text-align: center;
        overflow: hidden;
    }

    .awardImage{
        height: 100%;
    }
    
    .disclaimer {
        font-size: 0.8em;
        color: var(--g999);
        font-style: italic;
        text-align: center;
        margin: 0;
        line-height: 1em;
    }

    @media (max-width: 730px) {
        .awardHeader {
            height: 3.6em;
            font-size: 0.8em;
            width: 90px;
        }

        .awardLabel {
            width: 90px;
        }

        .subText {
            width: 90px;
        }
    }

    @media (max-width: 530px) {
        .awardIcon {
            height: 60px;
            width: 60px;
        }

        .awardHeader {
            height: 3.6em;
            font-size: 0.58em;
            width: 65px;
        }

        .awardLabel {
            font-size: 0.7em;
            width: 65px;
        }

        .subText {
            font-size: 0.6em;
            width: 65px; 
        }
    }


</style>

<div class="awardsCase">
    <h3>Team Awards & Records</h3>
    <div class="awardsCaseInner">
        {#each displayAwards as award}
            <div class="award">
                <div class="awardHeader">{award.type != 'award' ? award.type : ''}</div>
                <div class="awardIcon">
                    <img class="awardImage" src="{award.icon}" alt="trophy" />
                </div>
                <div class="awardLabel">{award.type == 'award' ? `${award.year} ` : ''}{computeAward(award.award)}</div>
                {#if award.extraInfo}
                    <div class="subText">{award.year ? `${award.year} ` : ''}{award.week ? `Week ${award.week} ` : ''}{award.year || award.week ? ' - ' : ''}{award.margin ? '+' : ''}{award.extraInfo}{award.wins ? '%' : ''}{award.iq ? '%' : ''}{award.pts || award.margin ? 'pts' : ''}</div>
                {/if}
            </div>
        {:else}
            <p class="sad">...nothing yet</p>
        {/each}
    </div>
</div>