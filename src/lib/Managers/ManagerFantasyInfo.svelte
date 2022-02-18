<script>
    import { gotoManager } from '$lib/utils/helper';

    export let viewManager, players, records;

    // FAVORITE PLAYER - scored the most all-time points for manager
    const favoritePlayer = records.recordArrays.managers.alltime.combined[viewManager.managerID].players.overallHighs[0].playerID;

    // RIVAL - most competitive match history
    let rivals = [];
    for(const manager in records.headToHeadRecords.combined.alltime[viewManager.managerID]) {
        const possRival = records.headToHeadRecords.combined.alltime[viewManager.managerID][manager];
        if(possRival.outcomes.match.W > 0 && possRival.outcomes.match.L > 0) rivals.push(possRival);
    }
    const rival = rivals.sort((a, b) => a.margins.match.mpg - b.margins.match.mpg)[0];

    // POSITION SPECIALTY - highest scoring compared to league average
    let positionPlacements = [];
    for(const position in records.recordArrays.league.alltime.combined.positions.leagueAverages) {
        const diff = records.recordArrays.league.alltime.combined.positions.leagueAverages[position].managerAverages.find(m => m.recordManID == viewManager.managerID).realPPG - records.recordArrays.league.alltime.combined.positions.leagueAverages[position].realPPG;
        positionPlacements.push({
            position,
            fptspg: records.recordArrays.league.alltime.combined.positions.leagueAverages[position].managerAverages.find(m => m.recordManID == viewManager.managerID).realPPG,
            rank: records.recordArrays.league.alltime.combined.positions.leagueAverages[position].managerAverages.indexOf(records.recordArrays.league.alltime.combined.positions.leagueAverages[position].managerAverages.find(m => m.recordManID == viewManager.managerID)) + 1,
            diff,
        })
    }
    const sortOrder = ['diff', 'rank']; 
    for(const sortType of sortOrder) {
        if(!positionPlacements[0][sortType] && positionPlacements[0][sortType] != 0) continue;
        if(sortType == 'diff') {
            positionPlacements = [...positionPlacements].sort((a,b) => b[sortType] - a[sortType]);
        } else {
            positionPlacements = [...positionPlacements].sort((a,b) => a[sortType] - b[sortType]);
        }
    }
    const positionSpecialty = positionPlacements[0].position;

    // TRADING SCALE - relative involvement in league trades
    let leagueTrades = 0;
    for(const manager of records.recordArrays.league.alltime.combined.transactions.trade) {
        leagueTrades += manager.trade;
    }
    const tradingScale = leagueTrades != 0 ? Math.round(10 * records.recordArrays.league.alltime.combined.transactions.trade.find(m => m.recordManID == viewManager.managerID).trade / leagueTrades) : 0;

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

    .playerIcon {
        align-items:flex-end;
    }

    .infoLabel {
        font-size: 0.7em;
        color: var(--blueOne);
        font-weight: 700;
        margin-bottom: 1em;
        height: 30px;
        width: 90px;
        text-align: center;
        line-height: 1.2em;
    }

    .infoAnswer {
        font-size: 0.8em;
        color: var(--g555);
        margin-top: 1em;
        width: 90px;
        text-align: center;
        line-height: 1.2em;
    }

    .tradingScale {
        line-height: 70px;
        font-size: 55px;
        color: var(--blueOne);
    }

    .rookiesOrVets {
        height: 65px;
        vertical-align: middle;
    }

    .infoRival {
        cursor: pointer;
    }

    .infoRival:hover .infoIcon {
        box-shadow: 0 0 6px 4px var(--aaa);
        border: 1px solid var(--aaa);
    }

    .rival {
        height: 100%;
    }

    .rebuildOrWin {
        height: 70px;
    }

    .valuePosition {
        line-height: 70px;
        font-size: 25px;
        color: var(--fff);
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

    .favoritePlayer {
        height: 65px;
        vertical-align: bottom;
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
    <!-- Rookies or Vets (optional) -->
    {#if viewManager.rookieOrVets}
        <div class="infoSlot">
            <div class="infoLabel">
                Rookie or Vet Preference
            </div>
            <div class="infoIcon">
                <img class="rookiesOrVets" src="/{viewManager.rookieOrVets}.png" alt="rookie or vet preference"/>
            </div>
            <div class="infoAnswer">
                {viewManager.rookieOrVets}
            </div>
        </div>
    {/if}
    <!-- Favorite fantasy position (optional) -->
    {#if viewManager.valuePosition}
        <div class="infoSlot">
            <div class="infoLabel">
                Position Specialty
            </div>
            <div class="infoIcon {positionSpecialty}">
                <span class="valuePosition">{positionSpecialty}</span>
            </div>
        </div>
    {/if}
    {#if viewManager.tradingScale}
        <!-- Trading Scale -->
        <div class="infoSlot">
            <div class="infoLabel">
                Desire to Trade
            </div>
            <div class="infoIcon">
                <span class="tradingScale">{tradingScale}</span>
            </div>
            <div class="infoAnswer">
                {tradingScale} out of 10
            </div>
        </div>
    {/if}
    <!-- Favorite player (optional) -->
    {#if favoritePlayer}
        <div class="infoSlot">
            <div class="infoLabel">
                Favorite Player
            </div>
            <div class="infoIcon playerIcon">
                <img class="favoritePlayer" src="https://sleepercdn.com/content/nfl/players/{favoritePlayer}.jpg" alt="favorite player"/>
            </div>
            <div class="infoAnswer">
                {players[favoritePlayer].fn} {players[favoritePlayer].ln}
            </div>
        </div>
    {/if}
    <!-- Rebuild Mod (optional) -->
    {#if viewManager.mode}
        <div class="infoSlot">
            <div class="infoLabel">
                Win Now or Rebuild?
            </div>
            <div class="infoIcon">
                <img class="rebuildOrWin" src="/{viewManager.mode.replace(' ', '%20')}.png" alt="win now or rebuild"/>
            </div>
            <div class="infoAnswer">
                {viewManager.mode}
            </div>
        </div>
    {/if}
    <!-- Rival -->
    <div class="infoSlot infoRival" on:click={() => gotoManager(rival.oppRecordManID)}>
        <div class="infoLabel">
            Rival
        </div>
        <div class="infoIcon">
            <img class="rival" src="{rival.oppManager.avatar}" alt="rival"/>
        </div>
        <div class="infoAnswer">
            {rival.oppManager.realname}
        </div>
    </div>
</div>