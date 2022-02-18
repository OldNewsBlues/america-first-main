<script>
    export let matchID, home, away, isComplete, matchSelection = matchID, showGameBox, showMatchBox;

    const changeMatchSelection = (newMatchID) => {
        matchSelection = newMatchID;
        showMatchBox = true;
        showGameBox = false;
        return matchSelection; 
    }

</script>

<style>
    .showSelected {
        position: relative;
        /* z-index: 2; */
        width: 100%;
		background-color: var(--gcScore);
        padding: 0 0.5em;
        border-radius: 1em;
        margin: 1.5% 0;
        box-shadow: inset 0px 3px 3px -2px rgb(0 0 0 / 30%), inset 0px 3px 4px 0px rgb(0 0 0 / 28%), inset 0px 1px 4px 3px var(--gcScoreShadow);
    }

    .scoresBlock {
        position: relative;
        margin: 0.5em 0;
        width: 100%;
		background-color: var(--gcScore);
        border-radius: 1em;
    }

    :global(.scoresBlock:hover) {
        cursor: pointer;
        background-color: var(--gcSelect);
    }

    .teamsBlock {
        display: inline-flex;
        position: relative;
        padding: 0.7em;
        align-items: center;
    }

    .teamLogo {
        display: inline-flex;
        width: 2.4em;
        height: fit-content;
        margin: 0 1em 0 0;
        border: 0.25px solid #777;
        border-radius: 50%;
    }

    .teamAbbrev {
        display: inline-flex;
        position: relative;
        color: var(--g111);
        font-weight: 600;
        font-size: 1.1em;
        padding: 0 0 0 0.2em;
    }

    .teamScoreContainer {
        display: inline-flex;
        position: absolute;
        left: 7.9em;
        width: 2em;
        align-items: center;
        justify-content: center;
    }

    .teamScore {
        color: var(--g555);
        display: inline-flex;
        position: relative;
        font-weight: 500;
        font-size: 1.05em;
        align-items: center;
        justify-content: center;
    }

    .gameComplete {
        display: inline-flex;
        position: relative;
        align-items: center;
        font-size: 1.05em;
        justify-content: center;
        color: var(--g111);
        top: 1.25em;
        left: 0.5em;
    }

    .gameStatusWrapper {
        display: inline-flex;
        flex-direction: column;
        position: absolute;
        align-items: center;
        justify-content: center;
        top: 1.75em;
        right: 0.6em;
        width: 6.5em;
    }

    .gameStatusPeriod {
        display: inline-flex;
        position: relative;
        font-size: 1.05em;
        align-content: center;
        justify-content: center;
        color: var(--g111);
    }

    .gameStatusClock {
        display: inline-flex;
        position: relative;
        font-size: 1.05em;
        align-content: center;
        justify-content: center;
        top: 1.25em;
        color: var(--g111);
    }
</style>

<div class="showSelected" style="{showMatchBox == true && matchSelection == matchID ? "background-color: var(--gcHighlight)" : null}">
    <div class="scoresBlock" on:click={() => changeMatchSelection(matchID)} style="{showMatchBox == true && matchSelection == matchID ? "background-color: var(--gcSelect)" : null}">
        <div class="teamsBlock">
            <img class="teamLogo" src="{home.matchInfo.manager.avatar}" alt="{home.matchInfo.manager.abbreviation}"/>
            <div class="teamAbbrev" style="{isComplete == true ? home.fpts < away.fpts ? "opacity: 0.5;" : "font-weight: 700;" : null}">{home.matchInfo.manager.abbreviation}</div>
            <div class="teamScoreContainer">
                <div class="teamScore" style="{isComplete == true ? home.fpts < away.fpts ? "opacity: 0.5;" : "font-weight: 700;" : null}">{home.fpts}</div>
            </div>
        </div>
        <br>
        <div class="teamsBlock">
            <img class="teamLogo" src="{away.matchInfo.manager.avatar}" alt="{away.matchInfo.manager.abbreviation}"/>
            <div class="teamAbbrev" style="{isComplete == true ? home.fpts > away.fpts ? "opacity: 0.5;" : "font-weight: 700;" : null}">{away.matchInfo.manager.abbreviation}</div>
            <div class="teamScoreContainer">
                <div class="teamScore" style="{isComplete == true ? home.fpts > away.fpts ? "opacity: 0.5;" : "font-weight: 700;" : null}">{away.fpts}</div>
            </div>
        </div>
        <div class="gameStatusWrapper">
            {#if isComplete == false}
                <div class="gameStatusPeriod">
                    To Play: {home.toPlay}
                </div>
                <div class="gameStatusClock">
                    To Play: {away.toPlay}
                </div>
            {:else}
                <div class="gameComplete">
                    Final
                </div>
            {/if}
        </div>
    </div>
</div>