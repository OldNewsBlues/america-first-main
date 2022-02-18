<script>
	import {cleanName} from '$lib/utils/helper';
	import { Icon } from '@smui/tab';

	export let move, number, type, masterOffset, prevManagers, players, allMoves, index, traders;
	
	let trade = type == 'trade' ? true : false;

	const getAvatar = (pos, player) => {
		if(pos == 'DEF') return `background-image: url(https://sleepercdn.com/images/team_logos/nfl/${player.toLowerCase()}.png)`;
		return `background-image: url(https://sleepercdn.com/content/nfl/players/thumb/${player}.jpg), url(https://sleepercdn.com/images/v2/icons/player_default.webp)`;
	}

	let origin, destination;

	const offset = 18;
	const originOffset = 10;

	let x1, x2;
    let innerWidth;

    const resize = (width) => {
		x1 = origin?.getBoundingClientRect() && destination?.getBoundingClientRect() ? (destination?.getBoundingClientRect().left > origin?.getBoundingClientRect().left ? origin?.getBoundingClientRect().right + originOffset - masterOffset : origin?.getBoundingClientRect().left - originOffset - masterOffset)  : 0;
		x2 = origin?.getBoundingClientRect() && destination?.getBoundingClientRect() ? (destination?.getBoundingClientRect().left > origin?.getBoundingClientRect().left ? destination?.getBoundingClientRect().left - offset - masterOffset : destination?.getBoundingClientRect().right + offset - masterOffset)  : 0;
    }

    $: resize(innerWidth);
    $: resize(masterOffset);

	const y = -28;
</script>

<svelte:window bind:innerWidth={innerWidth} />

<style>
	:global(.move) {
		text-align: center;
	}

	:global(.originalOwner) {
		color: #aaa;
		font-style: italic;
	}

	:global(.trade) {
		background-color: var(--fff);
	}

	:global(.Added) {
		background-color: var(--waiverAdd);
	}

	:global(.Dropped) {
		background-color: var(--waiverDrop);
	}

	.lineParent {
		position: relative;
		display: inline-flex;
		overflow: visible;
		width: 1px;
		height: 1px;
		margin: 0 10px;
		pointer-events: none;
		z-index: 2;
	}

	.line{
		position: relative;
		display: inline-flex;
		z-index: 2;
	}

	.playerAvatar {
		display: inline-flex;
		position: relative;
		align-items: center;
		justify-content: center;
		height: 45px;
		width: 45px;
		background-position: center;
		border-radius: 100%;
		background-repeat: no-repeat;
		background-size: auto 45px;
		margin: 0 0.2em;
	}

	.name {
		white-space: normal;
	}

	.pos {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 8px;
		width: 32px;
		height: 32px;
		margin: 0 0.5em;
	}

	:global(.QB) {
		background-color: var(--QB);
	}

	:global(.WR) {
		background-color: var(--WR);
	}

	:global(.RB) {
		background-color: var(--RB);
	}

	:global(.TE) {
		background-color: var(--TE);
	}

	:global(.FLEX) {
		background: linear-gradient(to right, var(--WR), var(--WR) 33.33%, var(--RB) 33.33%, var(--RB) 66.66%, var(--TE) 66.66%);
	}

	:global(.WRRB) {
		background: linear-gradient(to right, var(--WR), var(--WR) 50%, var(--RB) 50%);
	}

	:global(.K) {
		background-color: var(--K);
	}

	:global(.DEF) {
		background-color: var(--DEF);
	}

	:global(.indicator) {
		vertical-align: middle;
	}

	.nameHolder {
		margin: 6px 0;
    	display: inline-flex;
		align-items: center;
	}

	.destination {
		display: inline-flex;
		margin: 0 auto;
		width: 0px;
		height: 2px;
	}

	:global(.movesWrapper) {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 50%
	}

	.columnWrap {
		position: relative;
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
	}

	.rowWrap {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 100%;
	}
</style>

{#each move as cell}
	{#if cell && cell.player}
		{#if trade == false}
			<div class="movesWrapper {cell.type}" style="{number == 2 ? "width: 25%;" : null}">
				<div class="columnWrap">
					<div class="rowWrap">
						{#if cell.type == "Added"}
							<Icon class="indicator material-icons">arrow_drop_up</Icon>
						{:else if cell.type == "Dropped"}
							<Icon class="indicator material-icons">arrow_drop_down</Icon>
						{/if}
						{cell.type == "Added" || cell.type == "Dropped" ? cell.type : ""}
						{#if cell.type == "Added"}
							<Icon class="indicator material-icons">arrow_drop_up</Icon>
						{:else if cell.type == "Dropped"}
							<Icon class="indicator material-icons">arrow_drop_down</Icon>
						{/if}
					</div>
					<span class="nameHolder">
						<span class="pos {players[cell.player].pos}">{players[cell.player].pos}</span> 
						<div class="playerAvatar" style="{getAvatar(players[cell.player].pos, cell.player)}" />
						<span class="name" bind:this={origin}>{players[cell.player].pos == 'DEF' ? `${players[cell.player].ln} DEF` : `${players[cell.player].fn} ${players[cell.player].ln}`}</span>
					</span>
				</div>
			</div>
		{:else if cell.side == "origin"}
			{#if traders[0] == cell.rosterID}
				<div class="rowWrap trade" style="justify-content: flex-start;">
					<span class="nameHolder">
						<span class="pos {players[cell.player].pos}">{players[cell.player].pos}</span> 
						<div class="playerAvatar" style="{getAvatar(players[cell.player].pos, cell.player)}" />
						<span class="name" bind:this={origin}>{players[cell.player].pos == 'DEF' ? `${players[cell.player].ln} DEF` : `${players[cell.player].fn} ${players[cell.player].ln}`}</span>
					</span>
					<svg class="lineParent">
						<defs>
							<marker id="arrowhead" markerWidth="10" markerHeight="7" 
							refX="0" refY="2.5" orient="auto" fill="#ccc">
								<polygon points="0 0, 10 2.5, 0 5" />
							</marker>
						</defs>
						<line stroke-width="1.8px" stroke="#ccc" x1=0 y1=0 x2=20 y2=auto class="line" marker-end="url(#arrowhead)"/>
					</svg>
				</div>
			{:else}
				<div class="rowWrap trade" style="justify-content: flex-end;">
					<svg class="lineParent">
						<defs>
							<marker id="arrowhead" markerWidth="10" markerHeight="7" 
							refX="0" refY="2.5" orient="auto" fill="#ccc">
								<polygon points="0 0, 10 2.5, 0 5" />
							</marker>
						</defs>
						<line stroke-width="1.8px" stroke="#ccc" x1=0 y1=0 x2=-20 y2=auto class="line" marker-end="url(#arrowhead)"/>
					</svg>
					<span class="nameHolder">
						<span class="name" bind:this={origin}>{players[cell.player].pos == 'DEF' ? `${players[cell.player].ln} DEF` : `${players[cell.player].fn} ${players[cell.player].ln}`}</span>
						<div class="playerAvatar" style="{getAvatar(players[cell.player].pos, cell.player)}" />
						<span class="pos {players[cell.player].pos}">{players[cell.player].pos}</span>
					</span>
				</div>
			{/if}
		{/if}
	{:else if cell && cell.pick}
		<div class="movesWrapper {cell.type}">
			<span bind:this={origin} class="name">{cell.pick.season} Round {cell.pick.round}{@html cell.pick.original_owner ?  `<br /><span class="originalOwner">(${cell.pick.original_owner.original && cleanName(cell.pick.original_owner.original) != cleanName(prevManagers[cell.pick.original_owner.current].name) ? `${cell.pick.original_owner.original} [` : ''}${prevManagers[cell.pick.original_owner.current].name}${cell.pick.original_owner.original && cleanName(cell.pick.original_owner.original) != cleanName(prevManagers[cell.pick.original_owner.current].name)  ? ']' : ''})</span>` : ""}</span>
		</div>
	{:else if cell && cell.budget}
		<div class="movesWrapper {cell.type}">
			<span bind:this={origin} class="name">{cell.budget.amount}</span>
		</div>
	{/if}
{/each}






