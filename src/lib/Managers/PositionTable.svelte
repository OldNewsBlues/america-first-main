<script>
	import * as Pancake from '@sveltejs/pancake';
	import * as d3 from 'd3-hierarchy';
	import { tweened } from 'svelte/motion';
	import * as eases from 'svelte/easing';
	import { fade } from 'svelte/transition';
	import * as yootils from 'yootils';
	import Treemap from './Treemap.svelte';
	import { round } from '$lib/utils/helper';

	export let positionsInfo;

	const data = positionsInfo;
	let treemap = d3.treemap();

	let hierarchy = d3.hierarchy(data)
		.sum(d => d.value)
		.sort((a, b) => b.value - a.value)

	let root = treemap(hierarchy);

	let selected = root; 

	$: $extents = {
		x1: selected.x0,
		x2: selected.x1,
		y1: selected.y1,
		y2: selected.y0
	};

	const select = node => {
		while (node.parent && node.parent !== selected) {
			node = node.parent;
		}

		if (node && node.children) selected = node;
	};

	const breadcrumbs = node => {
		let pathText;
		let pathPoints;
		let pointsSet = false;
		const crumbs = [];
		while (node) {
			crumbs.unshift(node.data.name);
			if(node && pointsSet == false) {
				pathPoints = yootils.commas(round(node.value));
				pointsSet = true;
			}
			node = node.parent;
		}
		if(pathPoints) {
			pathText = crumbs.join('/') + ` - ${pathPoints} points`;
		} else {
			pathText = crumbs.join('/');
		}
		return pathText;
	};

	const extents = tweened(undefined, {
		easing: eases.cubicOut,
		duration: 600
	});

	const is_visible = (a, b) => {
		while (b) {
			if (a.parent === b) return true;
			b = b.parent;
		}
		return false;
	};
</script>

<style>
	.breadcrumbs {
		width: 100%;
		padding: 0.3rem 0.4rem;
		background-color: transparent;
		font-family: inherit;
		font-size: inherit;
		text-align: left;
		border: none;
		cursor: pointer;
		outline: none;
		color: var(--gcPlayRowText);
		font-weight: 420;
	}

	.breadcrumbs:disabled {
		cursor: default;
	}

	.chart {
		width: 100%;
		height: 600px;
		padding: 0;
		margin: 0 -1px 36px -1px;
		overflow: hidden;
	}

	.node {
		position: absolute;
		width: 100%;
		height: 100%;
		background-color: var(--gcBox);
		overflow: hidden;
		pointer-events: all;
	}

	.node:not(.leaf) {
		cursor: pointer;
	}

	.avatar {
        display: inline-flex;
        position: relative;
        align-items: center;
        width: auto;
        justify-content: center;
        height: fit-content;
		width: 22%;
		border: 0.25px solid var(--gcPlayRowText);
		border-radius: 1em;
    }

	.contents {
		width: 100%;
		height: 100%;
		padding: 0.3rem 0.4rem;
		border: 1px solid var(--gcPlayText);
		background-color: var(--gcScore);
		color: var(--gcPlayRowText);
		border-radius: 4px;
		box-sizing: border-box;
	}

	.playerColumn {
		display: inline-flex;
		position: relative;
		width: 100%;
		height: 100%;
		flex-direction: column;
	}

	.weeksColumn {
		display: inline-flex;
		position: relative;
		width: 100%;
		height: 100%;
		flex-direction: column;
		overflow-y: scroll;
	}

	.headerRow {
		display: inline-flex;
		position: relative;
		width: 100%;
		height: 4%;
	}

	.header {
		display: inline-flex;
		position: relative;
	}

	.yearsColumn {
		display: inline-flex;
		position: relative;
		width: 100%;
		height: 100%;
		flex-direction: column;
		overflow-y: scroll;
	}

	.playerRow {
		display: inline-flex;
		position: relative;
		width: 96%;
		height: 17%;
		padding: 2%;
	}

	.weekRow {
		display: inline-flex;
		position: relative;
		width: 96%;
		padding: 1%;
		margin: 0.1em 0;
		line-height: 1em;
		border-radius: 0.4em;
		background-color: var(--gcBanner);
		box-shadow: inset 0px 0px 0px -1px rgb(0 0 0 / 30%), inset 0px 1px 1px -1px rgb(0 0 0 / 28%), inset 0px 1px 3px 0px var(--gcScoreShadow);
	}

	.yearRow {
		display: inline-flex;
		position: relative;
		background-color: var(--gcBox);
		border-radius: 1em;
		width: 96%;
		height: 25%;
		padding: 1%;
		margin: 1%;
		box-shadow: inset 0px 0px 0px -2px rgb(0 0 0 / 30%), inset 0px 1px 3px -1px rgb(0 0 0 / 28%), inset 0px 1px 4px 1px var(--gcScoreShadow);
	}

	.playerName {
		display: inline-flex;
		position: relative;
		font-size: 1.8em;
		font-weight: 420;
		margin: 2%;
		line-height: 1em;
		width: 54%;
	}

	.yearText {
		display: inline-flex;
		position: relative;
		font-size: 1.5em;
		font-weight: 420;
	}

	.subText {
		display: inline-flex;
		position: relative;
		font-size: 1em;
		font-weight: 420;
	}

	.headerColumn {
		display: inline-flex;
		position: relative;
		flex-direction: column;
		width: 27%;
		margin: 1%;
	}

	.week {
		display: inline-flex;
		position: relative;
		width: 32.333%;
		margin: 0 0 0 1%;
	}

	.fpts {
		display: inline-flex;
		position: relative;
		justify-content: flex-end;
		margin: 0 1% 0 0;
		width: 32.333%;
	}

	.rank {
		display: inline-flex;
		position: relative;
		width: 33.333%;
		justify-content: center;
	}

	.nameParent {
		display: inline-flex;
		position: relative;
		font-size: 0.8em;
		font-weight: 420;
		margin: 2%;
		line-height: 1em;
	}

	.pointsParent {
		display: inline-flex;
		position: relative;
		font-size: 0.8em;
		font-weight: 420;
		margin: 0 2%;
	}

	.playerPoints {
		display: inline-flex;
		position: relative;
		font-size: 1.2em;
		font-weight: 420;
		line-height: 1em;
		align-items: center;
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

</style>

<button class="breadcrumbs" disabled="{!selected.parent}" on:click="{() => selected = selected.parent}">
	{breadcrumbs(selected)}
</button>

<div class="chart">
	{#await data}
		Loading position records...
	{:then}
		{#if data && data.name}
			<Pancake.Chart x1={$extents.x1} x2={$extents.x2} y1={$extents.y1} y2={$extents.y2}>
				<Treemap {root} let:node>
					{#if is_visible(node, selected)}
						<div
							transition:fade={{duration:400}}
							class="node"
							class:leaf={!node.children}
							on:click="{() => select(node)}"
						>
							<div class="contents {node.data.id != 'player' && node.data.id != 'parent' ? node.data.name : null}" style="{node.data.id != 'player' && node.data.id != 'parent' ? "color: #000;" : null}">
								<div class="playerColumn">
									<div class="playerRow">
										{#if node.data.id == 'player'}
											<img class="avatar" style="{node.data.position == 'DEF' ? "height: 100%; width: auto;" : null}" src="{node.data.avatar}" alt="" />
										{/if}
										<div class="{node.data.id != 'player' ? "nameParent" : "playerName"}">{node.data.name}</div>
										<div class="playerColumn" style="width: 30%; {node.data.id == 'player' ? "justify-content: center;" : null}">
											<div class="header" style="margin: 4% 0;">
												{#if node.data.id == 'player'}
													<div class="playerPoints" style="width: 40%;">PTS: </div>
												{/if}
												<div class="{node.data.id != 'player' ? "pointsParent" : "playerPoints"}" style="{node.data.id == 'player' ? "width: 50%; justify-content: flex-end;" : null}">{yootils.commas(round(node.value))}</div>
											</div>
											<div class="header" style="margin: 4% 0;">
												{#if node.data.id == 'player'}
													<div class="playerPoints" style="width: 40%;">PPG: </div>
													<div class="playerPoints" style="width: 50%; justify-content: flex-end;">{round(node.data.fpts.realPPG)}</div>
												{/if}
											</div>
										</div>
									</div>
									{#if node.data.id == 'player'}
										<div class="headerRow">
											<div class="header" style="width: 27%; margin: 0 0 0 3%;">
												Year
											</div>
											<div class="week" style="magin: 0 0 0 2%;">
												Week
											</div>
											<div class="rank">
												Team Rank
											</div>
											<div class="fpts" style="margin: 0 4% 0 0;">
												Points
											</div>
										</div>
										<div class="yearsColumn">
											{#each node.data.years as year}
												<div class="yearRow">
													<div class="headerColumn">
														<div class="yearText">
															{year.weeks[0].year}
														</div>
														<div class="header">
															<div class="subText" style="width: 40%;">PTS: </div>
															<div class="subText" style="justify-content: flex-end; width: 50%;">{round(year.fpts.real)}</div>
														</div>
														<div class="header">
															<div class="subText" style="width: 40%;">PPG:</div>
															<div class="subText" style="justify-content: flex-end; width: 50%;">{round(year.fpts.realPPG)}</div>
														</div>
													</div>
													<div class="weeksColumn">
														{#each year.weeks as week}
															<div class="weekRow" style="{week.topBottom == 'top' ? "border: 0.5px solid #1cb322" : week.topBottom == 'bottom' ? "border: 0.5px solid #e12929" : null}">
																<div class="week">
																	{week.week} 
																</div>
																<div class="rank">
																	{week.rank} 
																</div>
																<div class="fpts">
																	{round(week.fpts)}
																</div>
															</div>
														{/each}
													</div>
												</div>
											{/each}
										</div>
									{/if}
								</div>
							</div>
						</div>
					{/if}
				</Treemap>
			</Pancake.Chart>
		{/if}
	{/await}
</div>

