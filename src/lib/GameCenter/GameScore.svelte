<script>
    export let gameID, home, away, isComplete, gameState, gameSelection = gameID, showGameBox, showMatchBox;

    let timezone = 'CST';
    let kickoffDay;
    let kickoffTime;

    const changeGameSelection = (newGameSelection) => {
        gameSelection = newGameSelection;
        showGameBox = true;
        showMatchBox = false;

        return gameSelection;
    }
    $: changeGameSelection(gameSelection);
    

    const timezoneShift = (timezone, time) => {
        let newTimeHour;
        let oldTimeHour;
        let timePart = time.slice(time.length-2);
        if(time.slice(0, 2) == '12') {
            oldTimeHour = 12;
        } else {
            let strTimeHour = time.slice(1, 2);
            oldTimeHour = parseInt(strTimeHour);
        }

        if(timezone == 'CST') {
            newTimeHour = oldTimeHour == 1 ? 12 : oldTimeHour - 1;
            if(oldTimeHour == 12) timePart = 'AM'; 
        } else if(timezone == 'MST') {
            if(oldTimeHour == 1) {
                newTimeHour = 11;
                timePart = 'AM';
            } else if(oldTimeHour == 2) {
                newTimeHour = 12;
            } else {
                newTimeHour = oldTimeHour - 2;
            }
            if(oldTimeHour == 12) timePart = 'AM';
        } else if(timezone == 'PST') {
            if(oldTimeHour == 1) {
                newTimeHour = 10;
                timePart = 'AM';
            } else if(oldTimeHour == 2) {
                newTimeHour = 11;
                timePart = 'AM';
            } else if(oldTimeHour == 3) {
                newTimeHour = 12;
            } else {
                newTimeHour = oldTimeHour - 3;
            }
            if(oldTimeHour == 12) timePart = 'AM';
        }

        let shiftedTime = newTimeHour.toString() + time.slice(2, time.length - 2) + timePart;
        return shiftedTime;
    }

    let gameStatus = {
        quarter: home.status.period,
        quarterSuper: null,
        clock: home.status.displayClock,
    }

    if(home.status.period == 1) {
        gameStatus.quarterSuper = 'st';
    } else if(home.status.period == 2) {
        gameStatus.quarterSuper = 'nd';
    } else if(home.status.period == 3) {
        gameStatus.quarterSuper = 'rd';
    } else if(home.status.period == 4) {
        gameStatus.quarterSuper = 'th';
    } else {
        gameStatus.quarterSuper = null;
    }

    if(isComplete == true) {
        gameStatus.quarter = "Final";
        gameStatus.clock = "";
    } else if(gameState == 'pre') {

        kickoffDay = home.status.type.detail.slice(0, 3);
        let timeUnshifted = home.status.type.shortDetail.slice(home.status.type.shortDetail.length - 12, home.status.type.shortDetail.length - 4);
        kickoffTime = timezoneShift(timezone, timeUnshifted);

        gameStatus.quarter = kickoffDay;
        gameStatus.quarterSuper = '';
        gameStatus.clock = kickoffTime;
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
        max-width: 40px;
        padding: 0 1em 0 0;
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
        left: 7.7em;
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
<div class="showSelected" style="{showGameBox == true && gameSelection == gameID ? "background-color: var(--gcHighlight)" : null}">
    <div class="scoresBlock" on:click={() => changeGameSelection(gameID)} style="{showGameBox == true && gameSelection == gameID ? "background-color: var(--gcSelect)" : null}">
        <div class="teamsBlock">
            <img class="teamLogo" src="https://sleepercdn.com/images/team_logos/nfl/{home.sleeperID.toLowerCase()}.png" alt="{home.sleeperID}"/>
            <div class="teamAbbrev" style="{isComplete == true ? home.score < away.score ? "opacity: 0.5;" : "font-weight: 700;" : null}">{home.sleeperID}</div>
            <div class="teamScoreContainer">
                <div class="teamScore" style="{isComplete == true ? home.score < away.score ? "opacity: 0.5;" : "font-weight: 700;" : null}">{home.score}</div>
            </div>
        </div>
        <br>
        <div class="teamsBlock">
            <img class="teamLogo" src="https://sleepercdn.com/images/team_logos/nfl/{away.sleeperID.toLowerCase()}.png" alt="{away.sleeperID}"/>
            <div class="teamAbbrev" style="{isComplete == true ? home.score > away.score ? "opacity: 0.5;" : "font-weight: 700;" : null}">{away.sleeperID}</div>
            <div class="teamScoreContainer">
                <div class="teamScore" style="{isComplete == true ? home.score > away.score ? "opacity: 0.5;" : "font-weight: 700;" : null}">{away.score}</div>
            </div>
        </div>
        <div class="gameStatusWrapper">
            {#if isComplete == false}
                <div class="gameStatusPeriod">
                    {gameStatus.quarter}{gameStatus.quarterSuper}
                </div>
                <div class="gameStatusClock">
                    {gameStatus.clock}
                </div>
            {:else}
                <div class="gameComplete">
                    Final
                </div>
            {/if}
        </div>
    </div>
</div>