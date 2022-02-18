<script>
    export let recordManID, records;

    const ranks = [];

    for(const position in records.recordArrays.league.alltime.combined.positions.leagueAverages) {
        const managerRank = records.recordArrays.league.alltime.combined.positions.leagueAverages[position].managerAverages.find(m => m.recordManID == recordManID);
        ranks.push({
            pos: position,
            rank: records.recordArrays.league.alltime.combined.positions.leagueAverages[position].managerAverages.indexOf(managerRank) + 1,
            tot: records.recordArrays.league.alltime.combined.positions.leagueAverages[position].managerAverages.length,
        })
    }

</script>

<style>
    .fantasyInfos {
        display: flex;
        justify-content: space-around;
        align-items: flex-start;
        flex-wrap: wrap;
        padding: 0 0 2em;
        margin: 1.5em 0;
        border-bottom: 1px solid var(--aaa);
        border-top: 1px solid var(--aaa);
        box-shadow: 0 0 8px 4px var(--ccc);
    }

    .infoSlot {
        text-align: center;
        margin: 2em 1em 0;
    }

    .infoIcon {
        display: inline-flex;
        height: 70px;
        width: 70px;
        justify-content: center;
        align-items: center;
        border-radius: 100%;
        border: 1px solid var(--ccc);
        overflow: hidden;
        background-color: var(--fff);
		transition: box-shadow 0.4s;
    }

    .infoLabel {
        font-size: 1.2em;
        color: var(--blueOne);
        font-weight: 500;
        margin-bottom: 1em;
        height: 30px;
        width: 90px;
        text-align: center;
        line-height: 1.2em;
    }

    .valuePosition {
        line-height: 70px;
        font-size: 25px;
        color: var(--fff);
    }

    .total {
        position: absolute;
        font-size: 10px;
        color: var(--fff);
        margin: 38px 0 0 0;
        border-top: 0.25px solid var(--fff);
        line-height: 1.2em;
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

    .Picks {
        background: #73b647;
    }
    .K {
        background-color: var(--K);
    }

    .DEF {
        background-color: var(--DEF);
    }

    .CB {
        background-color: #ffcc7a;
    }

    .SS {
        background-color: #b7a1db;
    }

    .FS {
        background-color: #ebe7b3;
    }

    .DE {
        background-color: #b1d0e9;
    }

    .DL {
        background-color: #c392d3;
    }

    .LB {
        background-color: #98c097;
    }

    /* media queries */

    @media (max-width: 731px) {
        .infoSlot {
            margin: 2em 3em 0;
        }
    }

    @media (max-width: 558px) {
        .infoSlot {
            margin: 2em 2em 0;
        }
    }

    @media (max-width: 461px) {
        .infoSlot {
            margin: 2em 1em 0;
        }
    }
</style>

<div class="fantasyInfos">
    {#if ranks.length}
        {#each ranks as rank}
            <div class="infoSlot">
                <div class="infoLabel">
                    {rank.pos}
                </div>
                <div class="infoIcon {rank.pos}">
                    <span class="valuePosition">{rank.rank}</span>
                    <div class="total">{rank.tot}</div>
                </div>
            </div>
        {/each}
    {/if}

</div>