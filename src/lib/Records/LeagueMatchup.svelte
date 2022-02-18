<script>
 import { round } from '$lib/utils/helper';

 export let home, away;

 const positions = home.matchupInfo.positions;
</script>

<style>

    .matchContainer {
        position: relative;
        display: inline-flex;
        flex-direction: row;
        justify-content: space-around;
        align-items: flex-start;
        height: 86%;
        padding: 2%;
    }

    .positionsWrap {
        position: relative;
        display: inline-flex;
        flex-direction: column;
        height: 100%;
        width: auto;
        justify-content: space-evenly;
        align-items: center;
    }

    .rosterRowBox {
    	position: absolute;
        display: inline-flex;
        align-items: center;
        flex-direction: column;
        height: 100%;
        width: 1330%;
        border: 0.25px solid #555;
        border-radius: 1em;
        box-shadow: inset 0px 0px 0px -2px rgb(0 0 0 / 30%), inset 0px 1px 1px -1px rgb(0 0 0 / 28%), inset 0px 1px 4px 0px var(--gcScoreShadow);
    }

    .rosterPosition {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: 8%;
        width: 100%;
        border-radius: 25%;
        font-weight: 900;
    }

    .rosterRow {
        position: relative;
        display: inline-flex;
        align-items: center;
        flex-direction: row;
        height: 8%;
        width: 100%;
    }

    .rosterWrap {
        position: relative;
        display: inline-flex;
        flex-direction: column;
        height: 100%;
        width: 44%;
        justify-content: space-evenly;
        align-items: center;
    }

    .rosterPlayerInfo {
        position: relative;
        display: inline-flex;
        flex-direction: column;
        height: 100%;
        width: 95%;
        font-size: 0.85em;
        font-weight: 500;
        color: var(--gcPlayRowText);
    }

    .rosterPlayer {
        position: relative;
        display: inline-flex;
        flex-direction: row;
        height: 50%;
        width: 100%;
        align-items: center;
        line-height: 1em;
    }

    .rosterAvatar {
        position: relative;
        display: inline-flex;
        flex-direction: row;
        height: 96%;
        top: 3%;
        width: auto;
        align-items: center;
        overflow: hidden;
    }

    .avatarHolder {
        position: relative;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        flex-direction: row;
        height: 100%;
        width: 50%;
        border: 0.5px solid #555;
        border-radius: 1em 0 0 1em;
        overflow: hidden;
    }

    .totalPoints {
        position: relative;
        display: inline-flex;
        font-weight: 600;
        font-size: 1.2em;
        color: var(--g111);
    }

    .totalPointsRow {
        position: relative;
        display: inline-flex;
        justify-content: space-around;
        flex-direction: row;
        width: 100%;
        height: 8%;
        padding: 1%;
    }

    .totalPointsWrap {
        position: relative;
        display: inline-flex;
        flex-direction: column;
        width: 25%;
        height: 80%;
        border: 0.25px solid #777;
        border-radius: 0.9em;
        align-items: center;
        justify-content: center;
        line-height: 1em;
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

	.FLEX {
		background: linear-gradient(to right, var(--WR), var(--WR) 33.33%, var(--RB) 33.33%, var(--RB) 66.66%, var(--TE) 66.66%);
	}

	.WRRB_FLEX {
		background: linear-gradient(to right, var(--WR), var(--WR) 50%, var(--RB) 50%);
	}

    .REC_FLEX {
		background: linear-gradient(to right, var(--WR), var(--WR) 50%, var(--TE) 50%);
	}

    .SUPER_FLEX {
		background: conic-gradient(var(--RB) 0deg, var(--RB) 90deg, var(--QB) 90deg, var(--QB) 180deg, var(--TE) 180deg, var(--TE) 270deg, var(--WR) 270deg, var(--WR) 360deg);
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

    .IDP_FLEX {
        background: #000000;
    }
</style>

<div class="matchContainer">
    <div class="rosterWrap">
        {#each home.matchupInfo.starters as starter}
            {#if starter}
                <div class="rosterRow" style="justify-content: flex-start;">
                    <div class="avatarHolder" style="{starter.playerInfo.pos == 'DEF' ? "width: 52%; top: 1%; margin: 0 1% 0 0;" : "margin: 0 1% 0 0;"} right: 1%;"> 
                        <img class="rosterAvatar" src="{starter.avatar}" alt="" style="z-index: 2;">
                    </div>
                    <div class="rosterPlayerInfo" style="{starter.playerInfo.pos == 'DEF' ? "margin: 0 2% 0 0;" : null}" >
                        {#if starter.playerInfo.pos == 'DEF'}
                            <div class="rosterPlayer" style="justify-content: flex-start; margin: 0 7% 0 0;">{starter.playerInfo.ln} D/ST</div>
                        {:else}
                            <div class="rosterPlayer" style="justify-content: flex-start; margin: 0 3% 0 0;">{starter.playerInfo.fn.slice(0, 1)}. {starter.playerInfo.ln}</div>
                        {/if}
                        <div class="rosterPlayer" style="justify-content: flex-end; {starter.playerInfo.pos == 'DEF' ? "margin: 0 7% 0 0;" : "margin: 0 3% 0 0;"}">
                            <!-- {#if yearSelection == currentYear}
                                <div style="display: inline-flex; color: var(--g555); {yearSelection != currentYear ? "justify-content: flex-end;" : "justify-content: space-between;"}">({round(starter.projection)})</div>
                            {/if} -->
                            <div style="display: inline-flex; font-weight: 600; {starter.playerInfo.pos == 'DEF' ? "margin: 0 2% 0 0;" : "margin: 0 5% 0 0;"}">{round(starter.fpts)}</div>
                        </div>
                    </div>
                </div>
            {:else}
                <div class="rosterRow" style="justify-content: flex-start;">
                    <div class="avatarHolder" style="right: 1%;"> 
                        <img class="rosterAvatar" src="" alt="" style="z-index: 2;">
                    </div>
                    <div class="rosterPlayerInfo" >
                        <div class="rosterPlayer" style="justify-content: flex-start; margin: 0 3% 0 0; font-style: italic;">Empty</div>
                        <div class="rosterPlayer" style="justify-content: flex-end; margin: 0 3% 0 0;">
                            <!-- {#if yearSelection == currentYear}
                                <div style="display: inline-flex; color: var(--g555); {yearSelection != currentYear ? "justify-content: flex-end;" : "justify-content: space-between;"}">({round(starter.projection)})</div>
                            {/if} -->
                            <div style="display: inline-flex; font-weight: 600; margin: 0 5% 0 0;">0.00</div>
                        </div>
                    </div>
                </div>
            {/if}
        {/each}
    </div>
    <div class="positionsWrap">
        {#each positions as position}
            <div class="rosterPosition {position}">
                <div class="rosterRowBox" />
                {position}
            </div>
        {/each}
    </div>
    <div class="rosterWrap">
        {#each away.matchupInfo.starters as starter}
            {#if starter}
                <div class="rosterRow" style="justify-content: flex-end;">
                    <div class="rosterPlayerInfo">
                        {#if starter.playerInfo.pos == 'DEF'}
                            <div class="rosterPlayer" style="justify-content: flex-end; margin: 0 0 0 7%;">{starter.playerInfo.ln} D/ST</div>
                        {:else}
                            <div class="rosterPlayer" style="justify-content: flex-end; margin: 0 0 0 3%;">{starter.playerInfo.fn.slice(0, 1)}. {starter.playerInfo.ln}</div>
                        {/if}
                        <div class="rosterPlayer" style="justify-content: flex-start; {starter.playerInfo.pos == 'DEF' ? "margin: 0 0 0 7%;" : "margin: 0 0 0 3%;"}">
                            <div style="display: inline-flex; font-weight: 600; {starter.playerInfo.pos == 'DEF' ? "margin: 0 0 0 -2%;" : "margin: 0 0 0 2%;"}">{round(starter.fpts)}</div>  
                            <!-- {#if yearSelection == currentYear}
                                <div style="display: inline-flex; color: var(--g555); justify-content: flex-start;">({round(starter.projection)})</div>
                            {/if} -->
                        </div>
                    </div>                                
                    <div class="avatarHolder" style="{starter.playerInfo.pos == 'DEF' ? "width: 52%; top: 1%; margin: 0 0 0 5%;" : "margin: 0 0 0 2%;"} left: 1%; border-radius: 0 1em 1em 0;">
                        <img class="rosterAvatar" src="{starter.avatar}" alt="" />
                    </div>
                </div>
            {:else}
                <div class="rosterRow" style="justify-content: flex-end;">
                    <div class="rosterPlayerInfo">
                        <div class="rosterPlayer" style="justify-content: flex-end; margin: 0 0 0 3%; font-style: italic;">Empty</div>
                        <div class="rosterPlayer" style="justify-content: flex-start; margin: 0 0 0 3%;">
                            <div style="display: inline-flex; font-weight: 600; margin: 0 0 0 2%;">0.00</div>  
                            <!-- {#if yearSelection == currentYear}
                                <div style="display: inline-flex; color: var(--g555); justify-content: flex-start;">({round(starter.projection)})</div>
                            {/if} -->
                        </div>
                    </div>                                
                    <div class="avatarHolder" style="margin: 0 0 0 2%; left: 1%; border-radius: 0 1em 1em 0;">
                        <img class="rosterAvatar" src="" alt="" />
                    </div>
                </div>
            {/if}
        {/each}
    </div>
</div>
<div class="totalPointsRow">
    <div class="totalPointsWrap">
        <div class="totalPoints">{round(home.fpts.starters.real)}</div>
        <!-- {#if yearSelection == currentYear}
            <div class="projectedPoints">{round(match.home.projection)}</div>
        {/if} -->
    </div>
    <div class="totalPointsWrap">
        <div class="totalPoints">{round(away.fpts.starters.real)}</div>
        <!-- {#if yearSelection == currentYear}
            <div class="projectedPoints">{round(match.away.projection)}</div>
        {/if} -->
    </div>
</div>