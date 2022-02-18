<script>
    import Button, { Group, Label } from '@smui/button';
    import BarChart from '../BarChart.svelte'
    import { generateGraph, gotoManager, round, managers, capitalizeFirstLetter } from '$lib/utils/helper';
    import { Icon } from '@smui/tab';
    import LeagueMatchup from './LeagueMatchup.svelte';
  	import DataTable, { Head, Body, Row, Cell } from '@smui/data-table'; 

    export let selection = 'regular', displayPositionRecord = 'ALL', displayYear, waiversData, tradesData, wiresData, freeAgentData, transactions, weekRecords, weekLows, seasonLongRecords, seasonLongLows, showTies, winRecords, fptsHistories, medianRecords, lineupIQs, prefix, blowouts, closestMatchups, weekBests, weekWorsts, seasonBests, seasonWorsts, seasonEPERecords, playerSeasonTOPS, playerSeasonBests, playerWeekMissedTOPS, playerWeekBests, playerWeekMissedBests, playerWeekTOPS, allManagers, displayRecords, headToHeadRecords, playerOverallBests, playerOverallMissedBests, playerOverallTOPS, playerOverallMissedTOPS, gamesTOPS, gamesBests, blowoutBests, blowoutWorsts, narrowBests, narrowWorsts, bestBalls, potentialPoints, positions, projRecords, weekOvers, weekUnders, seasonOvers, seasonUnders, weekBestOvers, weekBestUnders, seasonBestOvers, seasonBestUnders, allTime=false;

    const leagueManagers = {};
    const numManagers = managers.length;
    const transTypes = [
        'draft',
        'trade',
        'waiver',
        'freeAgent',
    ]
    let recordPrefix = 'Regular Season';

    let numPositions;

	for(const manager of managers) {
		leagueManagers[manager.managerID] = {
			managerID: manager.managerID,
			rosterID: manager.roster,
			name: manager.name,
			status: manager.status,
			yearsactive: manager.yearsactive,
		}
	}

    const getPlayerPosGraphs = (displayRecords) => {
        let playerPosGraphs = [];
        numPositions = 0;
        for(const position of positions) {
            numPositions++;
            playerPosGraphs.push({
                position,
                Seasons: {
                    stats: displayRecords.positions[position].managerBests.periodHighs.stats,
                    x: 'Manager',
                    y: 'Points',
                    stat: '',
                    statCat: `periodHighs`,
                    header: `Best Season-Long Performances by ${position}`,
                    field: 'real',
                    short: `${position}`,
                    path: displayRecords.positions[position].managerBests.periodHighs.path,
                    pathKey: 'positions',
                    pathKey2: `managerBests`,
                },
                Weeks: {
                    stats: displayRecords.positions[position].managerBests.weekHighs.stats,
                    x: 'Manager',
                    y: 'Points',
                    stat: '',
                    statCat: `weekHighs`,
                    header: `Best Single-Week Performances by ${position}`,
                    field: 'fpts',
                    short: `${position}`,
                    path: displayRecords.positions[position].managerBests.weekHighs.path,
                    pathKey: 'positions',
                    pathKey2: `managerBests`,
                },
                Overall: {
                    stats: displayRecords.positions[position].managerBests.overallHighs.stats,
                    x: 'Manager',
                    y: 'Points',
                    stat: '',
                    statCat: `overallHighs`,
                    header: `Most Starting Points by ${position}`,
                    altHeader: `Most Combined Starting & Bench Points by ${position}`,
                    field: 'real',
                    short: `${position}`,
                    path: displayRecords.positions[position].managerBests.overallHighs.path,
                    pathKey: 'positions',
                    pathKey2: `managerBests`,
                },
                Bench: {
                    stats: displayRecords.positions[position].managerBests.overallMissedHighs.stats,
                    x: 'Manager',
                    y: 'Bench Points',
                    stat: '',
                    statCat: `overallMissedHighs`,
                    header: `Most Bench Points by ${position}`,
                    field: 'real',
                    short: `${position}`,
                    path: displayRecords.positions[position].managerBests.overallMissedHighs.path,
                    pathKey: 'positions',
                    pathKey2: `managerBests`,
                },
                Averages: {
                    stats: displayRecords.positions[position].leagueAverages.managerAverages.stats,
                    x: 'Manager',
                    y: 'PPG',
                    stat: '',
                    statCat: `managerAverages`,
                    header: `Average Score with ${position}`,
                    field: 'realPPG',
                    short: `${position}`,
                    path: displayRecords.positions[position].leagueAverages.managerAverages.path,
                    pathKey: 'positions',
                    pathKey2: `leagueAverages`,
                },
                Starts: {
                    stats: displayRecords.positions[position].managerBests.gamesHighs.stats,
                    x: 'Manager',
                    y: 'Starts',
                    stat: '',
                    statCat: `gamesHighs`,
                    header: `Most Weeks Started by ${position}`,
                    field: 'starters',
                    short: `${position}`,
                    path: displayRecords.positions[position].managerBests.gamesHighs.path,
                    pathKey: 'positions',
                    pathKey2: `managerBests`,
                },
                BenchWeek: {
                    stats: displayRecords.positions[position].managerBests.weekMissedHighs.stats,
                    x: 'Manager',
                    y: 'Bench Points',
                    stat: '',
                    statCat: `weekMissedHighs`,
                    header: `Best Single-Week Benchwarmers - ${position}`,
                    field: 'fpts',
                    short: `${position}`,
                    path: displayRecords.positions[position].managerBests.weekMissedHighs.path,
                    pathKey: 'positions',
                    pathKey2: `managerBests`,
                },
                WeekOver: {
                    stats: displayRecords.positions[position].managerBests.weekOvers.stats,
                    x: 'Manager',
                    y: 'Points Over Projection',
                    stat: '',
                    statCat: `weekOvers`,
                    header: `Biggest Single-Week Breakouts - ${position}`,
                    field: 'projDiff',
                    short: `${position}`,
                    path: displayRecords.positions[position].managerBests.weekOvers.path,
                    pathKey: 'positions',
                    pathKey2: `managerBests`,
                },
                WeekUnder: {
                    stats: displayRecords.positions[position].managerBests.weekUnders.stats,
                    x: 'Manager',
                    y: 'Points Under Projection',
                    stat: '',
                    statCat: `weekUnders`,
                    header: `Biggest Single-Week Busts - ${position}`,
                    field: 'projDiff',
                    short: `${position}`,
                    path: displayRecords.positions[position].managerBests.weekUnders.path,
                    pathKey: 'positions',
                    pathKey2: `managerBests`,
                    negative: true,
                },
                SeasonOver: {
                    stats: displayRecords.positions[position].managerBests.seasonOvers.stats,
                    x: 'Manager',
                    y: 'Points Over Projection',
                    stat: '',
                    statCat: `seasonOvers`,
                    header: `Biggest Season-Long Breakouts - ${position}`,
                    field: 'diff',
                    short: `${position}`,
                    path: displayRecords.positions[position].managerBests.seasonOvers.path,
                    pathKey: 'positions',
                    pathKey2: `managerBests`,
                },
                SeasonUnder: {
                    stats: displayRecords.positions[position].managerBests.seasonUnders.stats,
                    x: 'Manager',
                    y: 'Points Under Projection',
                    stat: '',
                    statCat: `seasonUnders`,
                    header: `Biggest Season-Long Busts - ${position}`,
                    field: 'diff',
                    short: `${position}`,
                    path: displayRecords.positions[position].managerBests.seasonUnders.path,
                    pathKey: 'positions',
                    pathKey2: `managerBests`,
                    negative: true,
                },
            })
        }
        return playerPosGraphs;
    }
    let playerPosGraphs = getPlayerPosGraphs(displayRecords);
    $: getPlayerPosGraphs(displayRecords);

    const getPlayerAcqGraphs = (displayRecords) => {
        let playerAcqGraphs = [];
        for(const transType of transTypes) {
            playerAcqGraphs.push({
                transType,
                Seasons: {
                    stats: displayRecords.acquisitions[transType].managerBests.periodHighs.stats,
                    x: 'Manager',
                    y: 'Points',
                    stat: '',
                    statCat: `periodHighs`,
                    header: transType == 'freeAgent' ? 'Best Season-Long Performances from Players Acquired through Free Agency' : `Best Season-Long Performances from Players Aquired by ${capitalizeFirstLetter(transType)}`,
                    field: 'real',
                    short: `${transType}`,
                    path: displayRecords.acquisitions[transType].managerBests.periodHighs.path,
                    pathKey: 'acquisitions',
                    pathKey2: `managerBests`,
                },
                Weeks: {
                    stats: displayRecords.acquisitions[transType].managerBests.weekHighs.stats,
                    x: 'Manager',
                    y: 'Points',
                    stat: '',
                    statCat: `weekHighs`,
                    header: transType == 'freeAgent' ? 'Best Single-Week Performances from Players Acquired through Free Agency' : `Best Single-Week Performances from Players Aquired by ${capitalizeFirstLetter(transType)}`,
                    field: 'fpts',
                    short: `${transType}`,
                    path: displayRecords.acquisitions[transType].managerBests.weekHighs.path,
                    pathKey: 'acquisitions',
                    pathKey2: `managerBests`,
                },
                Overall: {
                    stats: displayRecords.acquisitions[transType].managerBests.overallHighs.stats,
                    x: 'Manager',
                    y: 'Points',
                    stat: '',
                    statCat: `overallHighs`,
                    header: transType == 'freeAgent' ? 'Most Starting Points from Players Acquired through Free Agency' : `Most Starting Points from Players Aquired by ${capitalizeFirstLetter(transType)}`,
                    altHeader: transType == 'freeAgent' ? 'Most Combined Starting & Bench Points from Players Acquired through Free Agency' : `Most Combined Starting & Bench Points from Players Aquired by ${capitalizeFirstLetter(transType)}`,
                    field: 'real',
                    short: `${transType}`,
                    path: displayRecords.acquisitions[transType].managerBests.overallHighs.path,
                    pathKey: 'acquisitions',
                    pathKey2: `managerBests`,
                },
                Bench: {
                    stats: displayRecords.acquisitions[transType].managerBests.overallMissedHighs.stats,
                    x: 'Manager',
                    y: 'Bench Points',
                    stat: '',
                    statCat: `overallMissedHighs`,
                    header: transType == 'freeAgent' ? 'Most Bench Points from Players Acquired through Free Agency' : `Most Bench Points from Players Aquired by ${capitalizeFirstLetter(transType)}`,
                    field: 'real',
                    short: `${transType}`,
                    path: displayRecords.acquisitions[transType].managerBests.overallMissedHighs.path,
                    pathKey: 'acquisitions',
                    pathKey2: 'managerBests',
                },
                Averages: {
                    stats: displayRecords.acquisitions[transType].leagueAverages.managerAverages.stats,
                    x: 'Manager',
                    y: 'PPG',
                    stat: '',
                    statCat: `managerAverages`,
                    header: transType == 'freeAgent' ? 'Average Score with Players Acquired through Free Agency' : `Average Score with Players Acquired by ${capitalizeFirstLetter(transType)}`,
                    field: 'realPPG',
                    short: `${transType}`,
                    path: displayRecords.acquisitions[transType].leagueAverages.managerAverages.path,
                    pathKey: 'acquisitions',
                    pathKey2: `leagueAverages`,
                },
                Starts: {
                    stats: displayRecords.acquisitions[transType].managerBests.gamesHighs.stats,
                    x: 'Manager',
                    y: 'Starts',
                    stat: '',
                    statCat: `gamesHighs`,
                    header: transType == 'freeAgent' ? 'Most Weeks Started by Players Acquired through Free Agency' : `Most Weeks Started by Players Acquired by ${capitalizeFirstLetter(transType)}`,
                    field: 'weeks',
                    short: `${transType}`,
                    path: displayRecords.acquisitions[transType].managerBests.gamesHighs.path,
                    pathKey: 'acquisitions',
                    pathKey2: `managerBests`,
                },
                BenchWeek: {
                    stats: displayRecords.acquisitions[transType].managerBests.weekMissedHighs.stats,
                    x: 'Manager',
                    y: 'Bench Points',
                    stat: '',
                    statCat: `weekMissedHighs`,
                    header: transType == 'freeAgent' ? 'Best Single-Week Benchwarmers Acquired through Free Agency' : `Best Single-Week Benchwarmers Acquired by ${capitalizeFirstLetter(transType)}`,
                    field: 'fpts',
                    short: `${transType}`,
                    path: displayRecords.acquisitions[transType].managerBests.weekMissedHighs.path,
                    pathKey: 'acquisitions',
                    pathKey2: 'managerBests',
                },
                WeekOver: {
                    stats: displayRecords.acquisitions[transType].managerBests.weekOvers.stats,
                    x: 'Manager',
                    y: 'Points Over Projection',
                    stat: '',
                    statCat: `weekOvers`,
                    header: transType == 'freeAgent' ? 'Biggest Single-Week Breakouts from Players Acquired through Free Agency' : `Biggest Single-Week Breakouts from Players Acquired by - ${capitalizeFirstLetter(transType)}`,
                    field: 'projDiff',
                    short: `${transType}`,
                    path: displayRecords.acquisitions[transType].managerBests.weekOvers.path,
                    pathKey: 'acquisitions',
                    pathKey2: 'managerBests',
                },
                WeekUnder: {
                    stats: displayRecords.acquisitions[transType].managerBests.weekUnders.stats,
                    x: 'Manager',
                    y: 'Points Under Projection',
                    stat: '',
                    statCat: `weekUnders`,
                    header: transType == 'freeAgent' ? 'Biggest Single-Week Busts from Players Acquired through Free Agency' : `Biggest Single-Week Busts from Players Acquired by - ${capitalizeFirstLetter(transType)}`,
                    field: 'projDiff',
                    short: `${transType}`,
                    path: displayRecords.acquisitions[transType].managerBests.weekUnders.path,
                    pathKey: 'acquisitions',
                    pathKey2: `managerBests`,
                    negative: true,
                },
                SeasonOver: {
                    stats: displayRecords.acquisitions[transType].managerBests.seasonOvers.stats,
                    x: 'Manager',
                    y: 'Points Over Projection',
                    stat: '',
                    statCat: `seasonOvers`,
                    header: transType == 'freeAgent' ? 'Biggest Season-Long Breakouts from Players Acquired through Free Agency' : `Biggest Season-Long Breakouts from Players Acquired by - ${capitalizeFirstLetter(transType)}`,
                    field: 'diff',
                    short: `${transType}`,
                    path: displayRecords.acquisitions[transType].managerBests.seasonOvers.path,
                    pathKey: 'acquisitions',
                    pathKey2: `managerBests`,
                },
                SeasonUnder: {
                    stats: displayRecords.acquisitions[transType].managerBests.seasonUnders.stats,
                    x: 'Manager',
                    y: 'Points Under Projection',
                    stat: '',
                    statCat: `seasonUnders`,
                    header: transType == 'freeAgent' ? 'Biggest Season-Long Busts from Players Acquired through Free Agency' :  `Biggest Season-Long Busts from Players Acquired by - ${capitalizeFirstLetter(transType)}`,
                    field: 'diff',
                    short: `${transType}`,
                    path: displayRecords.acquisitions[transType].managerBests.seasonUnders.path,
                    pathKey: 'acquisitions',
                    pathKey2: `managerBests`,
                    negative: true,
                },
            })
        }
        return playerAcqGraphs;
    }
    let playerAcqGraphs = getPlayerAcqGraphs(displayRecords);
    $: getPlayerAcqGraphs(displayRecords);

    let weekOverGraph = {
        stats: weekOvers,
        x: 'Manager',
        y: 'Points Over Projection',
        stat: '',
        statCat: 'weekOvers',
        header: 'Biggest Single-Week Breakouts',
        field: 'projDiff',
        short: 'Weeks',
        path: displayRecords.players.managerBests.weekOvers.path,
        pathKey: 'players',
        pathKey2: 'managerBests',
    }
    $: weekOverGraph.stats = displayRecords.players.managerBests.weekOvers.stats;

    let weekUnderGraph = {
        stats: weekUnders,
        x: 'Manager',
        y: 'Points Under Projection',
        stat: '',
        statCat: 'weekUnders',
        header: 'Biggest Single-Week Busts',
        field: 'projDiff',
        short: 'Weeks',
        path: displayRecords.players.managerBests.weekUnders.path,
        pathKey: 'players',
        pathKey2: 'managerBests',
        negative: true,
    }
    $: weekUnderGraph.stats = displayRecords.players.managerBests.weekUnders.stats;
    
    let seasonOverGraph = {
        stats: seasonOvers,
        x: 'Manager',
        y: 'Points Over Projection',
        stat: '',
        statCat: 'seasonOvers',
        header: 'Biggest Season-Long Breakouts',
        field: 'diff',
        short: 'Seasons',
        path: displayRecords.players.managerBests.seasonOvers.path,
        pathKey: 'players',
        pathKey2: 'managerBests',
    }
    $: seasonOverGraph.stats = displayRecords.players.managerBests.seasonOvers.stats;

    let seasonUnderGraph = {
        stats: seasonUnders,
        x: 'Manager',
        y: 'Points Under Projection',
        stat: '',
        statCat: 'seasonUnders',
        header: 'Biggest Season-Long Busts',
        field: 'diff',
        short: 'Seasons',
        path: displayRecords.players.managerBests.seasonUnders.path,
        pathKey: 'players',
        pathKey2: 'managerBests',
        negative: true,
    }
    $: seasonUnderGraph.stats = displayRecords.players.managerBests.seasonUnders.stats;

    let lineupIQGraph = {
        stats: lineupIQs,
        x: "Manager",
        y: "Lineup IQ",
        stat: "%",
        statCat: 'lineupIqs',
        header: "Manager Lineup IQs",
        field: "iq",
        path: displayRecords.managerBests.lineupIqs.path,
        short: "Lineup IQ",
        pathKey: 'managerBests',
    }
    $: lineupIQGraph.stats = displayRecords.managerBests.lineupIqs.stats;

    let projectionsGraph = {
        stats: projRecords,
        secondStats: projRecords,
        x: "Manager",
        y: 'Points',
        stat: '',
        statCat: 'projRecords',
        secondStatCat: 'projRecords',
        header: 'Projected vs Total Points',
        field: 'proj',
        secondField: "real",
        short: "Overall",
        path: displayRecords.managerBests.projRecords.path,
        pathKey: 'managerBests',
    }
    $: projectionsGraph.stats = displayRecords.managerBests.projRecords.stats;

    let potentialPointsGraph = {
        stats: potentialPoints,
        secondStats: potentialPoints,
        x: "Manager",
        y: "Points",
        stat: "",
        statCat: 'fptsPoss',
        secondStatCat: 'fptsPoss',
        header: "Potential vs Total Points",
        field: "poss",
        secondField: "real",
        short: "Potential Points",
        path: displayRecords.managerBests.fptsPoss.path,
        pathKey: 'managerBests',
    }
    $: potentialPointsGraph.stats = displayRecords.managerBests.fptsPoss.stats;
    $: potentialPointsGraph.secondStats = displayRecords.managerBests.fptsPoss.stats;

    let winRecordsGraph = {
        stats: winRecords,
        x: "Manager",
        y: "Win %",
        stat: "%",
        statCat: 'winRecords',
        header: "Win Percentages",
        field: "perc",
        short: 'Overall',
        path: displayRecords.managerBests.winRecords.path,
        pathKey: 'managerBests',
    }
    $: winRecordsGraph.stats = displayRecords.managerBests.winRecords.stats;

    let blowoutBestGraph = {
        stats: blowoutBests,
        x: "Manager",
        y: "Points Margin of Victory",
        stat: "",
        statCat: 'blowoutBests',
        header: "Biggest Blowout Win",
        field: "matchDifferential",
        short: "Blowouts",
        path: displayRecords.managerBests.blowoutBests.path,
        pathKey: 'managerBests',
    }
    $: blowoutBestGraph.stats = displayRecords.managerBests.blowoutBests.stats;

    let blowoutWorstGraph = {
        stats: blowoutWorsts,
        x: "Manager",
        y: "Points Margin of Defeat",
        stat: "",
        statCat: 'blowoutWorsts',
        header: "Worst Shutout Loss",
        field: "matchDifferential",
        short: "Shutouts",
        path: displayRecords.managerBests.blowoutWorsts.path,
        pathKey: 'managerBests',
    }
    $: blowoutWorstGraph.stats = displayRecords.managerBests.blowoutWorsts.stats;

    let narrowBestGraph = {
        stats: narrowBests,
        x: "Manager",
        y: "Points Margin of Victory",
        stat: "",
        statCat: 'narrowBests',
        header: "Narrowest Victories",
        field: "matchDifferential",
        short: "Squeakers",
        path: displayRecords.managerBests.narrowBests.path,
        pathKey: 'managerBests',
        negative: true,
    }
    $: narrowBestGraph.stats = displayRecords.managerBests.narrowBests.stats;

    let narrowWorstGraph = {
        stats: narrowWorsts,
        x: "Manager",
        y: "Points Margin of Defeat",
        stat: "",
        statCat: 'narrowWorsts',
        header: "Narrowest Defeats",
        field: "matchDifferential",
        short: "Heartbreaks",
        pathKey: 'managerBests',
        path: displayRecords.managerBests.narrowWorsts.path,
        negative: true,
    }
    $: narrowWorstGraph.stats = displayRecords.managerBests.narrowWorsts.stats;

    let fptsSeasonBestGraph = {
        stats: seasonBests, 
        x: "Manager",
        y: "PPG",
        stat: "",
        statCat: 'periodHighs',
        header: "Highest Scoring Seasons",
        field: "realPPG",
        short: "Best",
        path: displayRecords.managerBests.periodHighs.path,
        pathKey: "managerBests",
    }
    $: fptsSeasonBestGraph.stats = displayRecords.managerBests.periodHighs.stats;

    let fptsSeasonWorstGraph = {
        stats: seasonWorsts,
        x: "Manager",
        y: "PPG",
        stat: "",
        statCat: 'periodLows',
        header: "Lowest Scoring Seasons",
        field: "realPPG",
        short: "Worst",
        path: displayRecords.managerBests.periodLows.path,
        pathKey: "managerBests",
    }
    $: fptsSeasonWorstGraph.stats = displayRecords.managerBests.periodLows.stats;

    let fptsWeekBestGraph = {
        stats: weekBests,
        x: "Manager",
        y: "Points",
        stat: "",
        statCat: 'weekHighs',
        header: "Highest Scoring Weeks",
        field: "fpts",
        short: "Best",
        path: displayRecords.managerBests.weekHighs.path,
        yMinOverride: 0,
        pathKey: 'managerBests',
    }
    $: fptsWeekBestGraph.stats = displayRecords.managerBests.weekHighs.stats;

    let fptsWeekWorstGraph = {
        stats: weekWorsts, 
        x: "Manager",
        y: "Points",
        stat: "",
        statCat: 'weekLows',
        header: "Lowest Scoring Weeks",
        field: "fpts",
        short: "Worst",
        path: displayRecords.managerBests.weekLows.path,
        yMinOverride: 0,
        pathKey: 'managerBests',
    }
    $: fptsWeekWorstGraph.stats = displayRecords.managerBests.weekLows.stats;

    let fptsHistoriesGraph = {
        stats: fptsHistories,
        x: "Manager",
        y: "Points",
        stat: "",
        statCat: 'fptsHistories',
        header: "Points",
        field: "real",
        short: "Scoring",
        path: displayRecords.managerBests.fptsHistories.path,
        pathKey: 'managerBests',
        classes: [
            {
                short: 'Totals',
                field: null,
            },
            {
                short: 'Positions',
                field: 'real',
                path: ['fpts', 'pos', 'key', 'starters'],
                colors: {
                    QB: '#ff2a6d',
                    WR: '#58a7ff',
                    RB: '#00ceb8',
                    TE: '#ffae58',
                    K: '#bd66ff',
                    DEF: '#fff67a',
                    DL: '#ff795a',
                    LB: '#6d7df5',
                    DB: '#ff7cb6',
                },
                totalField: 'real',
                totalPath: ['fpts', 'starters'],
                keys: positions.slice().reverse(),
            },
            {
                short: 'Acquisitions',
                field: 'real',
                path: ['fpts', 'trans', 'key', 'starters'],
                colors: {
                    draft: "#A33B20",
                    waiver: "#4D9078",
                    trade: "#F2C14E",
                },
                totalField: 'real',
                totalPath: ['fpts', 'starters'],
                keys: [
                    'trade',
                    'waiver',
                    'draft',
                ],
            },
        ],
    }
    $: fptsHistoriesGraph.stats = displayRecords.managerBests.fptsHistories.stats;

    let medianRecordsGraph = {
        stats: medianRecords,
        x: "Manager",
        y: "Win %",
        stat: "%",
        statCat: 'medianRecords',
        header: "Win Records Against Weekly League Median",
        field: "perc",
        short: "Median",
        path: displayRecords.managerBests.medianRecords.path,
        pathKey: 'managerBests',
    }
    $: medianRecordsGraph.stats = displayRecords.managerBests.medianRecords.stats;

    let bestBallGraph = {
        stats: bestBalls,
        x: "Manager",
        y: "Win %",
        stat: "%",
        statCat: 'bestBalls',
        header: "Win Records Assuming Optimal Lineup",
        field: "perc",
        short: "Best Ball",
        path: displayRecords.managerBests.bestBalls.path,
        pathKey: 'managerBests',
    }
    $: bestBallGraph.stats = displayRecords.managerBests.bestBalls.stats;

    let epeWinPercGraph = {
        stats: seasonEPERecords,
        x: "Manager",
        y: "EPE Win %",
        stat: "%",
        statCat: 'epeRecords',
        header: "Everyone Plays Everyone Win Record",
        field: "perc",
        short: "EPE",
        path: displayRecords.managerBests.epeRecords.path,
        pathKey: 'managerBests',
    }
    $: epeWinPercGraph.stats = displayRecords.managerBests.epeRecords.stats;

    let playerSeasonBestGraph = {
        stats: playerSeasonBests,
        x: "Manager",
        y: "Points",
        stat: "",
        statCat: 'periodHighs',
        header: "Best Season-Long Performances",
        field: "realPPG",
        short: "Seasons",
        path: displayRecords.players.managerBests.periodHighs.path,
        pathKey: 'players',
        pathKey2: 'managerBests',
    }
    $: playerSeasonBestGraph.stats = displayRecords.players.managerBests.periodHighs.stats;

    let playerWeekBestGraph = {
        stats: playerWeekBests,
        x: "Manager",
        y: "Points",
        stat: "",
        statCat: 'weekHighs',
        header: "Best Single-Week Performances",
        field: "fpts",
        short: "Weeks",
        path: displayRecords.players.managerBests.weekHighs.path,
        pathKey: 'players',
        pathKey2: 'managerBests',
    }
    $: playerWeekBestGraph.stats = displayRecords.players.managerBests.weekHighs.stats;

    let playerWeekMissedBestGraph = {
        stats: playerWeekMissedBests,
        x: "Manager",
        y: "Bench Points",
        stat: "",
        statCat: 'weekMissedHighs',
        header: "Best Single-Week Benchwarmers",
        field: "fpts",
        short: "Weeks",
        path: displayRecords.players.managerBests.weekMissedHighs.path,
        pathKey: 'players',
        pathKey2: 'managerBests',
    }
    $: playerWeekMissedBestGraph.stats = displayRecords.players.managerBests.weekMissedHighs.stats;

    let playerOverallBestGraph = {
        stats: playerOverallBests,
        x: "Manager",
        y: "Points",
        stat: "",
        statCat: 'overallHighs',
        header: "Top Cumulative Scorers",
        altHeader: 'Most Combined Starter & Bench Points',
        field: 'real',
        short: "Players",
        path: displayRecords.players.managerBests.overallHighs.path,
        pathKey: 'players',
        pathKey2: 'managerBests',
    }
    $: playerOverallBestGraph.stats = displayRecords.players.managerBests.overallHighs.stats;

    let playerOverallMissedBestGraph = {
        stats: playerOverallMissedBests,
        x: "Manager",
        y: "Bench Points",
        stat: "",
        statCat: 'overallMissedHighs',
        header: "Top Cumulative Benchwarmers",
        field: "real",
        short: "Players",
        path: displayRecords.players.managerBests.overallMissedHighs.path,
        pathKey: 'players',
        pathKey2: 'managerBests',
    }
    $: playerOverallMissedBestGraph.stats = displayRecords.players.managerBests.overallMissedHighs.stats;

    let gamesBestGraph = {
        stats: gamesBests,
        x: "Manager",
        y: "Starts",
        stat: "",
        statCat: 'gamesHighs',
        header: "Most Weeks Started",
        field: "starters",
        short: "Players",
        path: displayRecords.players.managerBests.gamesHighs.path,
        pathKey: 'players',
        pathKey2: 'managerBests',
    }
    $: gamesBestGraph.stats = displayRecords.players.managerBests.gamesHighs.stats;

    for(let i = 1; i <= numManagers; i++) {
        if(waiversData.find(w => w.recordManID == i)) {
            const trade = waiversData.find(w => w.recordManID == i);
            if(!tradesData.find(t => t.recordManID == i)) {
                tradesData.push({
                    recordManID: i,
                    manager: trade.manager,
                    trades: 0,
                })
            }
        }
    }

    let movesGraph = {
        stats: transactions,
        x: "Manager",
        y: "Transactions",
        stat: "",
        statCat: 'moves',
        header: "Total Transactions",
        field: "moves",
        path: displayRecords.transactions.moves.path,
        short: "Moves",
        pathKey: 'transactions',
    }
    $: movesGraph.stats = displayRecords.transactions.moves.stats;

    let wiresGraph = {
        stats: wiresData,
        x: "Manager",
        y: "Wire Transactions",
        stat: "",
        statCat: 'wires',
        header: "Total Wire Transactions",
        field: "wires",
        path: displayRecords.transactions.wires.path,
        short: "Wires",
        pathKey: 'transactions',
    }
    $: movesGraph.stats = displayRecords.transactions.wires.stats;

    let freeAgentGraph = {
        stats: freeAgentData,
        x: 'Manager',
        y: 'Pickups',
        stat: '',
        statCat: 'freeAgent',
        header: 'Free Agency Transactions',
        field: 'freeAgent',
        path: displayRecords.transactions.freeAgent.path,
        short: 'Free Agency',
        pathKey: 'transactions',
    }
    $: movesGraph.stats = displayRecords.transactions.freeAgent.stats;

    let tradesGraph = {
        stats: tradesData,
        x: "Manager",
        y: "Trades",
        stat: "",
        statCat: 'trade',
        header: "Completed Trades",
        field: "trade",
        short: "Trades",
        path: displayRecords.transactions.trade.path,
        pathKey: 'transactions',
    }
    $: tradesGraph.stats = displayRecords.transactions.trade.stats;

    let waiversGraph = {
        stats: waiversData,
        x: "Manager",
        y: "Pickups & Drops",
        stat: "",
        statCat: 'waiver',
        header: "Waivers Transactions",
        field: "waiver",
        short: "Waivers",
        path: displayRecords.transactions.waiver.path,
        pathKey: 'transactions',
    }
    $: waiversGraph.stats = displayRecords.transactions.waiver.stats;


    const getGraph = (graphData, newHeader = null, newField = null, newStat = null, newY = null, newPath = null) => {
        let graph = graphData;
        if(newHeader) graph.header = newHeader;
        if(newField) graph.field = newField;
        if(newStat || newStat == '') graph.stat = newStat;
        if(newY) graph.y = newY;
        if(newPath) graph.path = newPath;
        return generateGraph(graph);
    }

    const graphsObj = {
        Matchups: {
            Overall: {
                perc: getGraph(winRecordsGraph),
                W: getGraph(winRecordsGraph, 'Wins', 'W', '', 'Wins'),
                T: getGraph(winRecordsGraph, 'Ties', 'T', '', 'Ties'),
                L: getGraph(winRecordsGraph, 'Losses', 'L', '', 'Losses'),
                table: 0,
            },
            EPE: {
                perc: getGraph(epeWinPercGraph),
                W: getGraph(epeWinPercGraph, 'Everyone Plays Everyone - Wins', 'W', '', 'EPE Wins'),
                T: getGraph(epeWinPercGraph, 'Everyone Plays Everyone - Ties', 'T', '', 'EPE Ties'),
                L: getGraph(epeWinPercGraph, 'Everyone Plays Everyone - Losses', 'L', '', 'EPE Losses'),
                top: getGraph(epeWinPercGraph, 'Weeks with Highest Score', 'top', '', 'Weeks'),
                bottom: getGraph(epeWinPercGraph, 'Weeks with Lowest Score', 'bottom', '', 'Weeks'),
                table: 1,
            },
            Median: {
                perc: getGraph(medianRecordsGraph),
                W: getGraph(medianRecordsGraph, 'Above-Average Week Scores', 'W', '', 'Median Wins', ['outcomes', 'median']),
                T: getGraph(medianRecordsGraph, 'Ties with Week Average', 'T', '', 'Median Ties', ['outcomes', 'median']),
                L: getGraph(medianRecordsGraph, 'Below-Average Week Scores', 'L', '', 'Median Losses', ['outcomes', 'median']),
                marg: getGraph(medianRecordsGraph, 'Points Relative to Weekly Median', 'marg', '', 'Points Difference', ['margins', 'median']),
                mpg: getGraph(medianRecordsGraph, 'Points Per Game Relative to Weekly Median', 'mpg', '', 'PPG Difference', ['margins', 'median']),
                table: 2,
            },
            BestBall: {
                domPerc: getGraph(bestBallGraph),
                domWins: getGraph(bestBallGraph, 'Wins Assuming Optimal Lineups', 'W', '', 'Wins', ['outcomes', 'bball']),
                domTies: getGraph(bestBallGraph, 'Ties Assuming Optimal Lineups', 'T', '', 'Wins', ['outcomes', 'bball']),
                domLosses: getGraph(bestBallGraph, 'Losses Assuming Optimal Lineups', 'L', '', 'Wins', ['outcomes', 'bball']),
                epeDomPerc: getGraph(bestBallGraph, 'EPE Win Records Assuming Optimal Lineups', 'perc', '%', 'Win %', ['outcomes', 'bballEPE']),
                epeDomWins: getGraph(bestBallGraph, 'EPE Wins Assuming Optimal Lineups', 'W', '', 'Wins', ['outcomes', 'bballEPE']),
                epeDomTies: getGraph(bestBallGraph, 'EPE Ties Assuming Optimal Lineups', 'T', '', 'Ties', ['outcomes', 'bballEPE']),
                epeDomLosses: getGraph(bestBallGraph, 'EPE Losses Assuming Optimal Lineups', 'L', '', 'Losses', ['outcomes', 'bballEPE']),
                bestBalls: getGraph(bestBallGraph, 'Highest Scoring Optimal Lineups', 'top', '', 'Weeks', ['outcomes', 'bballEPE']),
                worstBalls: getGraph(bestBallGraph, 'Lowest Scoring Optimal Lineups', 'bottom', '', 'Weeks', ['outcomes', 'bballEPE']),  
                table: 3,              
            },
            Margins: {
                Blowouts: {
                    matchDifferential: getGraph(blowoutBestGraph),
                    table: 4,
                },
                Shutouts: {
                    matchDifferential: getGraph(blowoutWorstGraph),
                    table: 5,
                },
                Squeakers: {
                    matchDifferential: getGraph(narrowBestGraph),
                    table: 6,
                },
                Heartbreaks: {
                    matchDifferential: getGraph(narrowWorstGraph),
                    table: 7,
                },
            },
        },
        Scoring: {
            Overall: {
                fpts: getGraph(fptsHistoriesGraph),
                fptspg: getGraph(fptsHistoriesGraph, 'Points Per Game', 'realPPG', '', 'PPG', ['fpts', 'starters']),
                fptsAgainst: getGraph(fptsHistoriesGraph, 'Opponent Points', 'real', '', 'Opponent Points', ['fpts', 'opp']),
                table: 8,
            },
            Lineups: {
                iq: getGraph(lineupIQGraph),
                poss: getGraph(lineupIQGraph, 'Possible Points', 'poss', '', 'Points', ['fpts', 'starters']),
                fpts: getGraph(lineupIQGraph, 'Total Points', 'real', '', 'Points', ['fpts', 'starters']),
                iqWins: getGraph(lineupIQGraph, 'Set More Optimal Lineup than Opponent', 'W', '', 'Lineups', ['outcomes', 'iq']),
                iqTies: getGraph(lineupIQGraph, 'Set Equally Optimal Lineup as Opponent', 'T', '', 'Lineups', ['outcomes', 'iq']),
                iqLosses: getGraph(lineupIQGraph, 'Set Less Optimal Lineup than Opponant', 'L', '', 'Lineups', ['outcomes','iq']),
                iqPerc: getGraph(lineupIQGraph, 'Likelihood of Setting More Optimal Lineup than Opponent', 'perc', '%', 'Likelihood', ['outcomes', 'iq']),
                iqEpeW: getGraph(lineupIQGraph, 'Set More Optimal Lineup than Others', 'W', '', 'Lineups', ['outcomes', 'iqEPE']),
                iqEpeT: getGraph(lineupIQGraph, 'Set Equally Optimal Lineup to Others', 'T', '', 'Lineups', ['outcomes', 'iqEPE']),
                iqEpeL: getGraph(lineupIQGraph, 'Set Less Optimal Lineup than Others', 'L', '', 'Lineups', ['outcomes','iqEPE']),
                iqEpePerc: getGraph(lineupIQGraph, 'Likelihood of Setting More Optimal Lineup than Other Managers', 'perc', '%', 'Likelihood', ['outcomes', 'iqEPE']),
                perfects: getGraph(lineupIQGraph, 'Perfect Lineups Set', 'perfects', '', 'Lineups', []),
                topIqs: getGraph(lineupIQGraph, 'Set Most Optimal Lineup of the Week', 'top', '', 'Weeks', ['outcomes', 'iqEPE']),
                bottomIqs: getGraph(lineupIQGraph, 'Set Least Optimal Lineup of the Week', 'bottom', '', 'Weeks', ['outcomes', 'iqEPE']), 
                table: 9,
            },
            Potential: {
                fptsPoss: getGraph(potentialPointsGraph),
                fpts: getGraph(potentialPointsGraph, 'Starting Points', 'real', '', 'Points', ['fpts', 'starters']),
                fptspg: getGraph(potentialPointsGraph, 'Points Per Game', 'realPPG', '', 'PPG', ['fpts', 'starters']),
                fptsAgainst: getGraph(potentialPointsGraph, 'Opponent Points', 'real', '', 'Opponent Points', ['fpts', 'opp']),
                fptsAgainstPg: getGraph(potentialPointsGraph, 'Opponent Points Per Game', 'realPPG', '', 'Opponent PPG', ['fpts', 'opp']),
                fptsAgPoss: getGraph(potentialPointsGraph, 'Opponent Points Possible', 'poss', '', 'Points Possible', ['fpts', 'opp']),
                fptsAgPossPg: getGraph(potentialPointsGraph, 'Opponent Points Possibl Per Game', 'possPPG', '', 'Possible PPG', ['fpts', 'opp']),
                fptsPossPg: getGraph(potentialPointsGraph, 'Possible Points Per Game', 'possPPG', '', 'Possible PPG', ['fpts', 'starters']),
                benchPoints: getGraph(potentialPointsGraph, 'Bench Points', 'real', '', 'Bench Points', ['fpts', 'bench']),
                totalFpts: getGraph(potentialPointsGraph, 'Total Starting & Bench Points', 'real', '', 'Total Points', ['fpts', 'total']),
                totalPPG: getGraph(potentialPointsGraph, 'Total Starting & Bench Points Per Game', 'totalPPG', '', 'Total PPG', ['fpts', 'total']),
                benchPPG: getGraph(potentialPointsGraph, 'Bench Points Per Game', 'benchPPG', '', 'Bench PPG', ['fpts', 'bench']),
                table: 10,
            },
            Projections: {
                projFpts: getGraph(projectionsGraph),
                projPPG: getGraph(projectionsGraph, 'Projected Points Per Game', 'projPPG', '', 'PPG', ['fpts', 'starters']),
                fpts: getGraph(projectionsGraph, 'Starting Points', 'real', '', 'Points', ['fpts', 'starters']),
                fptspg: getGraph(projectionsGraph, 'Points Per Game', 'realPPG', '', 'PPG', ['fpts', 'starters']),
                fptsAgainst: getGraph(projectionsGraph, 'Opponent Points', 'real', '', 'Points', ['fpts', 'opp']),
                fptsAgainstPg: getGraph(projectionsGraph, 'Opponent Points Per Game', 'realPPG', '', 'PPG', ['fpts', 'opp']),
                projFptsAgainst: getGraph(projectionsGraph, 'Projected Opponent Points', 'proj', '', 'Points', ['fpts', 'opp']),
                projFptsAgainstPg: getGraph(projectionsGraph, 'Projected Opponent Points Per Game', 'projPPG', '', 'PPG', ['fpts', 'opp']),
                beatProj: getGraph(projectionsGraph, 'Outscored Weekly Projection', 'beatProj', '', 'Weeks', []),
                beatProjPerc: getGraph(projectionsGraph, 'Likelihood to Outscore Weekly Projection', 'beatProjPerc', '%', 'Likelihood', []),
                beatOptProj: getGraph(projectionsGraph, 'Outscored Optimized Weekly Projection', 'beatOptProj', '', 'Weeks', []),
                beatOptProjPerc: getGraph(projectionsGraph, 'Likelihood to Outscore Optimized Weekly Projection', 'beatOptProjPerc', '%', 'Likelihood', []),
                table: 11,
            },
            Seasons: {
                Best: {
                    fptspg: getGraph(fptsSeasonBestGraph),
                    fpts: getGraph(fptsSeasonBestGraph, 'Highest Scoring Seasons', 'real', '', 'Points'),
                    table: 12,
                },
                Worst: {
                    fptspg: getGraph(fptsSeasonWorstGraph),
                    fpts: getGraph(fptsSeasonWorstGraph, 'Lowest Scoring Seasons', 'real', '', 'Points'),
                    table: 13,
                }
            },
            Weeks: {
                Best: {
                    fpts: getGraph(fptsWeekBestGraph),
                    table: 14,
                },
                Worst: {
                    fpts: getGraph(fptsWeekWorstGraph),
                    table: 15,
                }
            },
        },
        Players: {
            Overall: {
                Points: {
                    fpts: allTime ? getGraph(playerOverallBestGraph, 'Top Cumulative Scorers', 'real', '', 'Points', ['fpts', 'starters']) : getGraph(playerOverallBestGraph, 'Most Combined Starting & Bench Points', 'real', '', 'Points', ['fpts', 'total']),
                    fptspg: allTime ? getGraph(playerOverallBestGraph, 'Points Per Game', 'realPPG', '', 'PPG', ['fpts', 'starters']) : getGraph(playerOverallBestGraph, 'Points Per Week', 'realPPG', '', 'PPW', ['fpts', 'total']),
                    topStarters: getGraph(playerOverallBestGraph, 'Weeks as Lineup-Leading Scorer', 'topStarters', '', 'Weeks', []),
                    bottomStarters: getGraph(playerOverallBestGraph, 'Weeks as Lineup-Worst Scorer', 'bottomStarters', '', 'Weeks', []),
                    starterRankAVG: getGraph(playerOverallBestGraph, 'Average Weekly Lineup Rank', 'starterRankAVG', '', 'Rank', []),
                    weeksStarted: getGraph(playerOverallBestGraph, 'Weeks Started', 'starters', '', 'Weeks', ['weeks']),
                    table: 16,
                },
                Starts: {
                    weeksStarted: getGraph(gamesBestGraph),
                    fptspg: getGraph(gamesBestGraph, 'Points Per Game', 'realPPG', '', 'PPG', ['fpts', 'starters']),
                    topStarters: getGraph(gamesBestGraph, 'Weeks as Lineup-Leading Scorer', 'topStarters', '', 'Weeks', []),
                    bottomStarters: getGraph(gamesBestGraph, 'Weeks as Lineup-Worst Scorer', 'bottomStarters', '', 'Weeks', []),
                    starterRankAVG: getGraph(gamesBestGraph, 'Average Weekly Lineup Rank', 'starterRankAVG', '', 'Rank', []),
                    fpts: getGraph(gamesBestGraph,`Starting Points of Top Starters`, 'real', '', 'Points', ['fpts', 'starters']),
                    table: 17,
                },
            },
            Starters: {
                Totals: {
                    Seasons: {
                        fpts: getGraph(playerSeasonBestGraph),
                        topStarters: getGraph(playerSeasonBestGraph, 'Weeks as Lineup-Leading Scorer', 'topStarters', '', 'Weeks', []),
                        bottomStarters: getGraph(playerSeasonBestGraph, 'Weeks as Lineup-Worst Scorer', 'bottomStarters', '', 'Weeks', []),
                        starterRankAVG: getGraph(playerSeasonBestGraph, 'Average Weekly Lineup Rank', 'starterRankAVG', '', 'Rank', []),
                        weeksStarted: getGraph(playerSeasonBestGraph, 'Weeks Started', 'starters', '', 'Weeks', ['weeks']),
                        fptspg: getGraph(playerSeasonBestGraph, 'Points Per Game', 'realPPG', '', 'PPG', ['fpts', 'starters']),
                        table: 18,
                    },
                    Weeks: {
                        fpts: getGraph(playerWeekBestGraph),
                        table: 19,
                    },
                },
                Breakouts: {
                    Seasons: {
                        diff: getGraph(seasonOverGraph),
                        diffpg: getGraph(seasonOverGraph, 'Points Over Projection Per Game', 'diffPG', '', 'Difference Per Game', ['fpts', 'starters']),
                        fpts: getGraph(seasonOverGraph, 'Total Points', 'real', '', 'Points', ['fpts', 'starters']),
                        fptspg: getGraph(seasonOverGraph, 'Points Per Game', 'realPPG', '', 'PPG', ['fpts', 'starters']),
                        projFpts: getGraph(seasonOverGraph, 'Projected Points', 'proj', '', 'Points', ['fpts', 'starters']),
                        projFptsPg: getGraph(seasonOverGraph, 'Projected Points Per Game', 'projPPG', '', 'PPG', ['fpts', 'starters']),
                        topStarters: getGraph(seasonOverGraph, 'Weeks as Lineup-Leading Scorer', 'topStarters', '', 'Weeks', []),
                        bottomStarters: getGraph(seasonOverGraph, 'Weeks as Lineup-Worst Scorer', 'bottomStarters', '', 'Weeks', []),
                        starterRankAVG: getGraph(seasonOverGraph, 'Average Weekly Lineup Rank', 'starterRankAVG', '', 'Rank', []),
                        weeksStarted: getGraph(seasonOverGraph, 'Weeks Started', 'starters', '', 'Weeks', ['weeks']),
                        table: 20,
                    },
                    Weeks: {
                        projDiff: getGraph(weekOverGraph),
                        fpts: getGraph(weekOverGraph, 'Total Points', 'real', '', 'Points'),
                        projFpts: getGraph(weekOverGraph, 'Projected Points', 'proj', '', 'Points'),
                        table: 21,
                    },
                },
                Busts: {
                    Seasons: {
                        diff: getGraph(seasonUnderGraph),
                        diffpg: getGraph(seasonUnderGraph, 'Points Over Projection Per Game', 'diffPG', '', 'Difference Per Game', ['fpts', 'starters']),
                        fpts: getGraph(seasonUnderGraph, 'Total Points', 'real', '', 'Points', ['fpts', 'starters']),
                        fptspg: getGraph(seasonUnderGraph, 'Points Per Game', 'realPPG', '', 'PPG', ['fpts', 'starters']),
                        projFpts: getGraph(seasonUnderGraph, 'Projected Points', 'proj', '', 'Points', ['fpts', 'starters']),
                        projFptsPg: getGraph(seasonUnderGraph, 'Projected Points Per Game', 'projPPG', '', 'PPG', ['fpts', 'starters']),
                        topStarters: getGraph(seasonUnderGraph, 'Weeks as Lineup-Leading Scorer', 'topStarters', '', 'Weeks', []),
                        bottomStarters: getGraph(seasonUnderGraph, 'Weeks as Lineup-Worst Scorer', 'bottomStarters', '', 'Weeks', []),
                        starterRankAVG: getGraph(seasonUnderGraph, 'Average Weekly Lineup Rank', 'starterRankAVG', '', 'Rank', []),
                        weeksStarted: getGraph(seasonUnderGraph, 'Weeks Started', 'starters', '', 'Weeks', ['weeks']),
                        table: 22,
                    },
                    Weeks: {
                        projDiff: getGraph(weekUnderGraph),
                        fpts: getGraph(weekUnderGraph, 'Total Points', 'real', '', 'Points'),
                        projFpts: getGraph(weekUnderGraph, 'Projected Points', 'proj', '', 'Points'),
                        table: 23,
                    },
                },
            },
            Bench: {
                Overall: {
                    benchPoints: getGraph(playerOverallMissedBestGraph),
                    weeksBenched: getGraph(playerOverallMissedBestGraph, 'Weeks Benched', 'bench', '', 'Weeks', ['weeks']),
                    benchPPG: getGraph(playerOverallMissedBestGraph, 'Bench Points Per Game', 'realPPG', '', 'Bench PPG', ['fpts', 'bench']),
                    table: 24,
                },
                Weeks: {
                    benchPoints: getGraph(playerWeekMissedBestGraph),
                    table: 25,
                }
            },
        },
        Transactions: {
            Overall: {
                moves: getGraph(movesGraph),
                table: 26,
            },
            Trades: {
                trade: getGraph(tradesGraph),
                table: 26,
            },
            Wires: {
                trade: getGraph(wiresGraph),
                table: 26,
            },
            Waivers: {
                waiver: getGraph(waiversGraph),
                outbid: getGraph(waiversGraph, 'Failed Waiver Bids', 'outbid', '', 'Failed Bids'),
                waiverPerc: getGraph(waiversGraph, 'Waiver Bid Success Rates', 'waiverPerc', '%', 'Success Rate'),
                table: 26,
            },
            FreeAgent: {
                trade: getGraph(freeAgentGraph),
                table: 26,
            },
        },
        Positions: {},
        Acquisitions: {},
    };

    for(let i = 0; i < playerPosGraphs.length; i++) {
        const graph = playerPosGraphs[i];
        graphsObj.Positions[graph.position] = {
            Overall: {
                Points: {
                    fpts: allTime ? getGraph(graph.Overall, `Most Starting Points by ${graph.position}`, 'real', '', 'Points', ['fpts', 'starters']) : getGraph(graph.Overall, `Most Combined Starting & Bench Points by ${graph.position}`, 'real', '', 'Points', ['fpts', 'total']),
                    fptspg: allTime ? getGraph(graph.Overall, 'Points Per Game', 'realPPG', '', 'PPG', ['fpts', 'starters']) : getGraph(graph.Overall, 'Points Per Week', 'realPPG', '', 'PPW', ['fpts', 'total']),
                    topStarters: getGraph(graph.Overall, 'Weeks as Lineup-Leading Scorer', 'topStarters', '', 'Weeks', []),
                    bottomStarters: getGraph(graph.Overall, 'Weeks as Lineup-Worst Scorer', 'bottomStarters', '', 'Weeks', []),
                    starterRankAVG: getGraph(graph.Overall, 'Average Weekly Lineup Rank', 'starterRankAVG', '', 'Rank', []),
                    weeksStarted: getGraph(graph.Overall, 'Weeks Started', 'starters', '', 'Weeks', ['weeks']),
                    table: 27 + (11 * i),
                },
                Starts: {
                    weeksStarted: getGraph(graph.Starts),
                    fptspg: getGraph(graph.Starts, 'Points Per Game', 'realPPG', '', 'PPG', ['fpts', 'starters']),
                    topStarters: getGraph(graph.Starts, 'Weeks as Lineup-Leading Scorer', 'topStarters', '', 'Weeks', []),
                    bottomStarters: getGraph(graph.Starts, 'Weeks as Lineup-Worst Scorer', 'bottomStarters', '', 'Weeks', []),
                    starterRankAVG: getGraph(graph.Starts, 'Average Weekly Lineup Rank', 'starterRankAVG', '', 'Rank', []),
                    fpts: getGraph(graph.Starts,`Total Points by Most-Started ${graph.position}s`, 'real', '', 'Points', ['fpts', 'starters']),
                    table: 28 + (11 * i),
                },
            },
            Scoring: {
                Seasons: {
                    fpts: getGraph(graph.Seasons),
                    topStarters: getGraph(graph.Seasons, 'Weeks as Lineup-Leading Scorer', 'topStarters', '', 'Weeks', []),
                    bottomStarters: getGraph(graph.Seasons, 'Weeks as Lineup-Worst Scorer', 'bottomStarters', '', 'Weeks', []),
                    starterRankAVG: getGraph(graph.Seasons, 'Average Weekly Lineup Rank', 'starterRankAVG', '', 'Rank', []),
                    weeksStarted: getGraph(graph.Seasons, 'Weeks Started', 'starters', '', 'Weeks', ['weeks']),
                    fptspg: getGraph(graph.Seasons, 'Points Per Game', 'realPPG', '', 'PPG', ['fpts', 'starters']),
                    table: 29 + (11 * i),
                },
                Weeks: {
                    fpts: getGraph(graph.Weeks),
                    table: 30 + (11 * i),
                },
            },
            Breakouts: {
                Seasons: {
                    diff: getGraph(graph.SeasonOver),
                    diffpg: getGraph(graph.SeasonOver, 'Points Over Projection Per Game', 'diffPG', '', 'Difference Per Game', ['fpts', 'starters']),
                    fpts: getGraph(graph.SeasonOver, 'Total Points', 'real', '', 'Points', ['fpts', 'starters']),
                    fptspg: getGraph(graph.SeasonOver, 'Points Per Game', 'realPPG', '', 'PPG', ['fpts', 'starters']),
                    projFpts: getGraph(graph.SeasonOver, 'Projected Points', 'proj', '', 'Points', ['fpts', 'starters']),
                    projFptsPg: getGraph(graph.SeasonOver, 'Projected Points Per Game', 'projPPG', '', 'PPG', ['fpts', 'starters']),
                    topStarters: getGraph(graph.SeasonOver, 'Weeks as Lineup-Leading Scorer', 'topStarters', '', 'Weeks', []),
                    bottomStarters: getGraph(graph.SeasonOver, 'Weeks as Lineup-Worst Scorer', 'bottomStarters', '', 'Weeks', []),
                    starterRankAVG: getGraph(graph.SeasonOver, 'Average Weekly Lineup Rank', 'starterRankAVG', '', 'Rank', []),
                    weeksStarted: getGraph(graph.SeasonOver, 'Weeks Started', 'starters', '', 'Weeks', ['weeks']),
                    table: 31 + (11 * i),
                },
                Weeks: {
                    projDiff: getGraph(graph.WeekOver),
                    fpts: getGraph(graph.WeekOver, 'Total Points', 'fpts', '', 'Points'),
                    projFpts: getGraph(graph.WeekOver, 'Projected Points', 'projFpts', '', 'Points'),
                    table: 32 + (11 * i),
                },
            },
            Busts: {
                Seasons: {
                    diff: getGraph(graph.SeasonUnder),
                    diffpg: getGraph(graph.SeasonUnder, 'Points Over Projection Per Game', 'diffPG', '', 'Difference Per Game', ['fpts', 'starters']),
                    fpts: getGraph(graph.SeasonUnder, 'Total Points', 'real', '', 'Points', ['fpts', 'starters']),
                    fptspg: getGraph(graph.SeasonUnder, 'Points Per Game', 'realPPG', '', 'PPG', ['fpts', 'starters']),
                    projFpts: getGraph(graph.SeasonUnder, 'Projected Points', 'proj', '', 'Points', ['fpts', 'starters']),
                    projFptsPg: getGraph(graph.SeasonUnder, 'Projected Points Per Game', 'projPPG', '', 'PPG', ['fpts', 'starters']),
                    topStarters: getGraph(graph.SeasonUnder, 'Weeks as Lineup-Leading Scorer', 'topStarters', '', 'Weeks', []),
                    bottomStarters: getGraph(graph.SeasonUnder, 'Weeks as Lineup-Worst Scorer', 'bottomStarters', '', 'Weeks', []),
                    starterRankAVG: getGraph(graph.SeasonUnder, 'Average Weekly Lineup Rank', 'starterRankAVG', '', 'Rank', []),
                    weeksStarted: getGraph(graph.SeasonUnder, 'Weeks Started', 'starters', '', 'Weeks', ['weeks']),
                    table: 33 + (11 * i),
                },
                Weeks: {
                    projDiff: getGraph(graph.WeekUnder),
                    fpts: getGraph(graph.WeekUnder, 'Total Points', 'fpts', '', 'Points'),
                    projFpts: getGraph(graph.WeekUnder, 'Projected Points', 'projFpts', '', 'Points'),
                    table: 34 + (11 * i),
                },
            },
            Bench: {
                Overall: {
                    benchPoints: getGraph(graph.Bench),
                    weeksBenched: getGraph(graph.Bench, 'Weeks Benched', 'bench', '', 'Weeks', ['weeks']),
                    benchPPG: getGraph(graph.Bench, 'Bench Points Per Game', 'realPPG', '', 'Bench PPG', ['fpts', 'bench']),
                    table: 35 + (11 * i),
                },
                Weeks: {
                    benchPoints: getGraph(graph.BenchWeek),
                    table: 36 + (11 * i),
                },
            },
            Averages: {
                fptspg: getGraph(graph.Averages),
                fpts: getGraph(graph.Averages, `Total Points with ${graph.position}`, 'real', '', 'Points'),
                perc: getGraph(graph.Averages, `Percentage of All Points from ${graph.position}s`, 'perc', '%', 'Share of Total'),
                table: 37 + (11 * i),
            },
        }
    }
    
    for(let i = 0; i < playerAcqGraphs.length; i++) {
        const graph = playerAcqGraphs[i];
        graphsObj.Acquisitions[graph.transType] = {
            Overall: {
                Points: {
                    fpts: allTime ? getGraph(graph.Overall, `Most Points from Players Acquired by ${capitalizeFirstLetter(graph.transType)}`, 'real', '', 'Points', ['fpts', 'trans', graph.transType, 'starters']) : getGraph(graph.Overall, `Most Combined Starter & Bench Points from Players Aquired by ${capitalizeFirstLetter(graph.transType)}`, 'real', '', 'Points', ['fpts', 'trans', graph.transType, 'total']),
                    fptspg: allTime ? getGraph(graph.Overall, `Most Points Per Game from Players Acquired by ${capitalizeFirstLetter(graph.transType)}`, 'realPPG', '', 'PPG', ['fpts', 'trans', graph.transType, 'starters']) : getGraph(graph.Overall, 'Points Per Week', 'realPPG', '', 'PPW', ['fpts', 'trans', graph.transType, 'total']),
                    topStarters: getGraph(graph.Overall, `Weeks as Lineup-Leading Scorer - Highest-Scoring Players Acquired by ${capitalizeFirstLetter(graph.transType)}`, 'topStarters', '', 'Weeks', []),
                    bottomStarters: getGraph(graph.Overall, `Weeks as Lineup-Worst Scorer - Highest-Scoring Players Acquired by ${capitalizeFirstLetter(graph.transType)}`, 'bottomStarters', '', 'Weeks', []),
                    starterRankAVG: getGraph(graph.Overall, `Average Weekly Lineup Rank of Highest-Scoring Players Acquired by ${capitalizeFirstLetter(graph.transType)}`, 'starterRankAVG', '', 'Rank', []),
                    weeksStarted: getGraph(graph.Overall, `Weeks Started by Highest-Scoring Players Acquired by ${capitalizeFirstLetter(graph.transType)}`, 'weeks', '', 'Weeks', ['fpts', 'trans', graph.transType, 'starters']),
                    table: 38 + (11 * (numPositions - 1)) + (11 * i),
                },
                Starts: {
                    weeksStarted: getGraph(graph.Starts),
                    fptspg: getGraph(graph.Starts, `Points Per Game from Most-Started Players Acquired by ${capitalizeFirstLetter(graph.transType)}`, 'realPPG', '', 'PPG', ['fpts', 'trans', graph.transType, 'starters']),
                    topStarters: getGraph(graph.Starts, `Weeks as Lineup-Leading Scorer - Most-Started Players Acquired by ${capitalizeFirstLetter(graph.transType)}`, 'topStarters', '', 'Weeks', []),
                    bottomStarters: getGraph(graph.Starts, `Weeks as Lineup-Worst Scorer - Most-Started Players Acquired by ${capitalizeFirstLetter(graph.transType)}`, 'bottomStarters', '', 'Weeks', []),
                    starterRankAVG: getGraph(graph.Starts, `Average Weekly Lineup Rank of Most-Started Players Acquired by ${capitalizeFirstLetter(graph.transType)}`, 'starterRankAVG', '', 'Rank', []),
                    fpts: getGraph(graph.Starts,`Points from Most-Started Players Acquired by ${capitalizeFirstLetter(graph.transType)}`, 'real', '', 'Points', ['fpts', 'trans', graph.transType, 'starters']),
                    table: 39 + (11 * (numPositions - 1)) + (11 * i),
                },
            },
            Scoring: {
                Seasons: {
                    fpts: getGraph(graph.Seasons),
                    topStarters: getGraph(graph.Seasons, `Weeks as Lineup-Leading Scorer - Season-Leading Players Acquired by ${capitalizeFirstLetter(graph.transType)}`, 'topStarters', '', 'Weeks', []),
                    bottomStarters: getGraph(graph.Seasons, `Weeks as Lineup-Worst Scorer - Season-Leading Players Acquired by ${capitalizeFirstLetter(graph.transType)}`, 'bottomStarters', '', 'Weeks', []),
                    starterRankAVG: getGraph(graph.Seasons, 'Average Weekly Lineup Rank', 'starterRankAVG', '', 'Rank', []),
                    weeksStarted: getGraph(graph.Seasons, 'Weeks Started', 'weeks', '', 'Weeks', ['fpts', 'trans', graph.transType, 'starters']),
                    fptspg: getGraph(graph.Seasons, 'Points Per Game', 'realPPG', '', 'PPG', ['fpts', 'trans', graph.transType, 'starters']),
                    table: 40 + (11 * (numPositions - 1)) + (11 * i),
                },
                Weeks: {
                    fpts: getGraph(graph.Weeks),
                    table: 41 + (11 * (numPositions - 1)) + (11 * i),
                },
            },
            Breakouts: {
                Seasons: {
                    diff: getGraph(graph.SeasonOver),
                    diffpg: getGraph(graph.SeasonOver, 'Points Over Projection Per Game', 'diffPG', '', 'Difference Per Game', ['fpts', 'trans', graph.transType, 'starters']),
                    fpts: getGraph(graph.SeasonOver, 'Total Points', 'real', '', 'Points', ['fpts', 'trans', graph.transType, 'starters']),
                    fptspg: getGraph(graph.SeasonOver, 'Points Per Game', 'realPPG', '', 'PPG', ['fpts', 'trans', graph.transType, 'starters']),
                    projFpts: getGraph(graph.SeasonOver, 'Projected Points', 'proj', '', 'Points', ['fpts', 'trans', graph.transType, 'starters']),
                    projFptsPg: getGraph(graph.SeasonOver, 'Projected Points Per Game', 'projPPG', '', 'PPG', ['fpts', 'trans', graph.transType, 'starters']),
                    topStarters: getGraph(graph.SeasonOver, 'Weeks as Lineup-Leading Scorer', 'topStarters', '', 'Weeks', []),
                    bottomStarters: getGraph(graph.SeasonOver, 'Weeks as Lineup-Worst Scorer', 'bottomStarters', '', 'Weeks', []),
                    starterRankAVG: getGraph(graph.SeasonOver, 'Average Weekly Lineup Rank', 'starterRankAVG', '', 'Rank', []),
                    weeksStarted: getGraph(graph.SeasonOver, 'Weeks Started', 'weeks', '', 'Weeks', ['fpts', 'trans', graph.transType, 'starters']),
                    table: 42 + (11 * (numPositions - 1)) + (11 * i),
                },
                Weeks: {
                    projDiff: getGraph(graph.WeekOver),
                    fpts: getGraph(graph.WeekOver, 'Total Points', 'fpts', '', 'Points'),
                    projFpts: getGraph(graph.WeekOver, 'Projected Points', 'projFpts', '', 'Points'),
                    table: 43 + (11 * (numPositions - 1)) + (11 * i),
                },
            },
            Busts: {
                Seasons: {
                    diff: getGraph(graph.SeasonUnder),
                    diffpg: getGraph(graph.SeasonUnder, 'Points Over Projection Per Game', 'diffPG', '', 'Difference Per Game', ['fpts', 'trans', graph.transType, 'starters']),
                    fpts: getGraph(graph.SeasonUnder, 'Total Points', 'real', '', 'Points', ['fpts', 'trans', graph.transType, 'starters']),
                    fptspg: getGraph(graph.SeasonUnder, 'Points Per Game', 'realPPG', '', 'PPG', ['fpts', 'trans', graph.transType, 'starters']),
                    projFpts: getGraph(graph.SeasonUnder, 'Projected Points', 'proj', '', 'Points', ['fpts', 'trans', graph.transType, 'starters']),
                    projFptsPg: getGraph(graph.SeasonUnder, 'Projected Points Per Game', 'projPPG', '', 'PPG', ['fpts', 'trans', graph.transType, 'starters']),
                    topStarters: getGraph(graph.SeasonUnder, 'Weeks as Lineup-Leading Scorer', 'topStarters', '', 'Weeks', []),
                    bottomStarters: getGraph(graph.SeasonUnder, 'Weeks as Lineup-Worst Scorer', 'bottomStarters', '', 'Weeks', []),
                    starterRankAVG: getGraph(graph.SeasonUnder, 'Average Weekly Lineup Rank', 'starterRankAVG', '', 'Rank', []),
                    weeksStarted: getGraph(graph.SeasonUnder, 'Weeks Started', 'weeks', '', 'Weeks', ['fpts', 'trans', graph.transType, 'starters']),
                    table: 44 + (11 * (numPositions - 1)) + (11 * i),
                },
                Weeks: {
                    projDiff: getGraph(graph.WeekUnder),
                    fpts: getGraph(graph.WeekUnder, 'Total Points', 'fpts', '', 'Points'),
                    projFpts: getGraph(graph.WeekUnder, 'Projected Points', 'projFpts', '', 'Points'),
                    table: 45 + (11 * (numPositions - 1)) + (11 * i),
                },
            },
            Bench: {
                Overall: {
                    benchPoints: getGraph(graph.Bench),
                    weeksBenched: getGraph(graph.Bench, 'Weeks Benched', 'weeks', '', 'Weeks', ['fpts', 'trans', graph.transType, 'bench']),
                    benchPPG: getGraph(graph.Bench, 'Bench Points Per Game', 'realPPG', '', 'Bench PPG', ['fpts', 'trans', graph.transType, 'bench']),
                    table: 46 + (11 * (numPositions - 1)) + (11 * i),
                },
                Weeks: {
                    benchPoints: getGraph(graph.BenchWeek),
                    table: 47 + (11 * (numPositions - 1)) + (11 * i),
                },
            },
            Averages: {
                fptspg: getGraph(graph.Averages),
                fpts: getGraph(graph.Averages, `Total Points with Player Acquired by ${capitalizeFirstLetter(graph.transType)}`, 'real', '', 'Points'),
                perc: getGraph(graph.Averages, `Percentage of All Points from Players Acquired by ${capitalizeFirstLetter(graph.transType)}`, 'perc', '%', 'Share of Total'),
                table: 48 + (11 * (numPositions - 1)) + (11 * i),
            },
        }
    }
    

    let managerChoices = {
        all: [],
        left: [],
        right: [],
    };
    let allMatchups = [];
    let selectedMatchup;
    let displayManagerLeft, displayManagerRight;

    let headToHeadShowTies = {
        match: false,
        EPE: false,
    }

    let displayMatchup;

    const changeManager = (newManager, side, displayYear, selection) => {

        if(side == 'left') {
            managerChoices.right = managerChoices.all.filter(m => m.recordManID != newManager);
            displayManagerLeft = {
                info: headToHeadRecords[displayManagerRight.recordManID][newManager].oppManager,
                recordManID: newManager,
            };
        } else {
            managerChoices.left = managerChoices.all.filter(m => m.recordManID != newManager);
            displayManagerRight = {
                info: headToHeadRecords[displayManagerLeft.recordManID][newManager].oppManager,
                recordManID: newManager,
            };
        }
        if(displayManagerRight.recordManID && displayManagerLeft.recordManID) {
            for(const key in headToHeadRecords[displayManagerLeft.recordManID][displayManagerRight.recordManID]) {
                if(key != 'oppRecordManID' && key != 'oppManager') {
                    displayManagerLeft[key] = headToHeadRecords[displayManagerLeft.recordManID][displayManagerRight.recordManID][key];
                    displayManagerRight[key] = headToHeadRecords[displayManagerRight.recordManID][displayManagerLeft.recordManID][key];
                } 
            }
            headToHeadShowTies.match = displayManagerLeft.outcomes.match.T > 0 ? true : false;
            headToHeadShowTies.epe = displayManagerLeft.outcomes.EPE.T > 0 ? true : false;

            selectedMatchup = 0;
            allMatchups = [];
            for(let i = 0; i < displayManagerLeft.matchups.length; i++) {
                allMatchups.push({
                    home: displayManagerLeft.matchups[i],
                    away: displayManagerRight.matchups[i],
                })
            }
            displayMatchup = {
                home: displayManagerLeft.matchups[selectedMatchup],
                away: displayManagerRight.matchups[selectedMatchup],
            }
        }
    }
 
    const getHead = (displayYear, selection) => {
        
        managerChoices.all = [];
        displayManagerLeft = {};
        displayManagerRight = {};
        for(const manager in headToHeadRecords) {
            managerChoices.all.push({
                info: allManagers[manager],
                recordManID: manager,
            });
            if(!displayManagerLeft.recordManID) {
                displayManagerLeft.recordManID = manager;
                continue;
            }
            if(!displayManagerRight.recordManID) {
                displayManagerRight.recordManID = manager;
                displayManagerLeft.info = headToHeadRecords[manager][displayManagerLeft.recordManID].oppManager;
            }
        }
        managerChoices.right = managerChoices.all.filter(m => m.recordManID != displayManagerLeft.recordManID);
        changeManager(displayManagerRight.recordManID, 'right', displayYear, selection);

        return managerChoices;
    }
    $: getHead(displayYear, selection);

    managerChoices = getHead(displayYear, selection);


    let curTable = 0;
    let curGraph = Object.keys(graphsObj)[0];
    let curGraphKey = Object.keys(graphsObj[curGraph])[0];
    let curGraphKey2 = Object.keys(graphsObj[curGraph][curGraphKey])[0];   
    let curGraphKey3 = !Object.keys(graphsObj[curGraph][curGraphKey]).includes('table') ? Object.keys(graphsObj[curGraph][curGraphKey][curGraphKey2])[0] : null;
    let curGraphKey4 = !curGraphKey3 || !Object.keys(graphsObj[curGraph][curGraphKey][curGraphKey2][curGraphKey3]).includes('table') ? null : Object.keys(graphsObj[curGraph][curGraphKey][curGraphKey2][curGraphKey3])[0];

    let oldGraph = curGraph;
    const changeTable = (newGraph, newGraphKey, newGraphKey2, newGraphKey3, newGraphKey4) => {
       
        if(newGraph != oldGraph) {
            curGraphKey = Object.keys(graphsObj[newGraph])[0];
            curGraphKey2 = Object.keys(graphsObj[newGraph][curGraphKey])[0];
            curGraphKey3 = !Object.keys(graphsObj[newGraph][curGraphKey]).includes('table') ? Object.keys(graphsObj[newGraph][curGraphKey][curGraphKey2])[0] : null;
            curGraphKey4 = !curGraphKey3 || !Object.keys(graphsObj[newGraph][curGraphKey][curGraphKey2][curGraphKey3]).includes('table') ? null : Object.keys(graphsObj[newGraph][curGraphKey][curGraphKey2][curGraphKey3])[0];
            newGraphKey = curGraphKey;
            newGraphKey2 = curGraphKey2;
            newGraphKey3 = curGraphKey3;
            newGraphKey4 = curGraphKey4;
            oldGraph = newGraph;
        }

        if(Object.keys(graphsObj[newGraph][newGraphKey]).includes('table')) {
            curTable = graphsObj[newGraph][newGraphKey].table;
        } else if(Object.keys(graphsObj[newGraph][newGraphKey][newGraphKey2]).includes('table')) {
            curTable = graphsObj[newGraph][newGraphKey][newGraphKey2].table;
        } else {
            curTable = graphsObj[newGraph][newGraphKey][newGraphKey2][newGraphKey3].table;
        }
    }

    $: changeTable(curGraph, curGraphKey, curGraphKey2, curGraphKey3, curGraphKey4);

    const toggles = (marginType = null, newPeriod = null, newMatchUp = null) => {

        if(marginType) marginRecordHeading = marginType == 'blowout' ? 'Blowouts' : 'Nailbiters';
        if(newPeriod) {
            if(newPeriod == 'regular') {
                recordPrefix = 'Regular Season';
            } else if(newPeriod == 'playoffs') {
                recordPrefix = 'Playoffs';
            } else if(newPeriod == 'combined') {
                recordPrefix = 'Combined';
            }
        }
        if(newMatchUp && displayManagerLeft && displayManagerRight) {
            displayMatchup = {
                home: displayManagerLeft.matchups[newMatchUp],
                away: displayManagerRight.matchups[newMatchUp],
            }
        }

    }
    $: toggles(displayMarginRecord, selection, selectedMatchup);

    let displayWeekRecord = 'high';
    let displaySeasonRecord = 'high';
    let displayMarginRecord = 'blowout';
    let marginRecordHeading = 'Blowouts';
    let displayPlayerRecord = 'overall';

    let rand = 1;
    let curSort = {
        sort: null,
        inverted: false,
    };
    const changeSort = (path, newRecordArray, newKey, newPath = null, inverted = false, newAltPath = null, graphKey = null) => {
        let applyPath = newAltPath && !allTime ? newAltPath : newPath ? newPath : null;
        if(path.sort == newKey) {
            if(path.inverted == false) {
                newRecordArray.sort((a, b) => a[newKey] - b[newKey]);
                path.inverted = true;
                curSort.inverted = true;
            } else {
                newRecordArray.sort((a, b) => b[newKey] - a[newKey]);
                path.inverted = false;
                curSort.inverted = false;
            }
        } else {
            if(applyPath) {
                for(let i = 0; i < applyPath.length; i++) {
                    newRecordArray = newRecordArray[applyPath[i]];
                }
                path.path = applyPath;
            }
            if(inverted == false) {
                newRecordArray.sort((a, b) => b[newKey] - a[newKey]);
            } else {
                newRecordArray.sort((a, b) => a[newKey] - b[newKey]);
            }
            path.sort = newKey;
        } 
        rand = rand * Math.random();
        if(graphKey) curSort.sort = graphKey;
    }
    
    let innerWidth;

</script>

<svelte:window bind:innerWidth={innerWidth} />

<style>
    :global(.header) {
        text-align: center;
    }

    /* recordTable styling */

    :global(.recordTable) {
        box-shadow: 0px 3px 3px -2px var(--boxShadowOne), 0px 3px 4px 0px var(--boxShadowTwo), 0px 1px 8px 0px var(--boxShadowThree);
        margin: 2em;
        background-color: var(--gcComponent);
    }

    :global(.recordTable th) {
        background-color: var(--gcMain);
        text-align: center;
        color: var(--gcBannerText);
    }

    :global(.recordTable td) {
        background-color: var(--gcSelect);
        color: var(--gcPlayRowText);
        font-weight: 400;
    }

    :global(.recordTable thead tr) {
        background-color: var(--gcMain);
    }

    :global(.recordTable tbody tr) {
        background-color: var(--gcSelect);
    }

    :global(.recordTable table) {
        background-color: var(--gcBox);
    }

    /* rankingTable styling */

    :global(.rankingTable) {
        display: table;
        box-shadow: 0px 3px 3px -2px var(--boxShadowOne), 0px 3px 4px 0px var(--boxShadowTwo), 0px 1px 8px 0px var(--boxShadowThree);
        margin: 2em auto 0.5em;
        background-color: var(--gcComponent);
    }

    :global(.rankingTable th) {
        background-color: var(--gcMain);
        text-align: center;
        color: var(--gcBannerText);
    }

    :global(.rankingTable td) {
        background-color: var(--gcSelect);
        color: var(--gcPlayRowText);
        font-weight: 400;
    }

    :global(.rankingTable thead tr) {
        background-color: var(--gcMain);
    }

    :global(.rankingTable tbody tr) {
        background-color: var(--gcSelect);
    }

    :global(.rankingTable table) {
        background-color: var(--gcBox);
    }

    .playerAvatar {
		vertical-align: middle;
		height: 45px;
		width: 45px;
		background-position: center;
		background-repeat: no-repeat;
		background-size: auto 45px;
	}

    .playerInfo {
        display: inline-block;
        padding: 0 0 0 20px;
    }
    
    .rankingHolder {
        display: block;
        width: 100%;
        overflow-x: hidden;
    }

    .subTitle {
        font-style: italic;
        font-size: 0.7em;
        color: #888;
        line-height: 1.2em;
    }

    .fantasyTeamName {
        font-style: italic;
        color: #999;
        font-size: 0.8em;
        line-height: 1.1em;
    }

    .rankingTableWrapper {
        width: 25%;
    }

    .rankingInner {
        position: relative;
        display: flex;
        flex-wrap: nowrap;
        width: 1500%;
		transition: margin-left 0.8s;
    }

    .buttonHolder {
        text-align: center;
        margin: 2em 0;
        width: 100%;
        display: inline-flex;
        position: relative;
        align-items: center;
        justify-content: center;
        line-height: 1.15em;
        flex-wrap: wrap;
    }

    :global(.cellName) {
        cursor: pointer;
        line-height: 1.2em;
    }

    :global(.differentialName) {
        padding: 0.7em 0;
    }

    .center {
        text-align: center;
    }

    .left {
        text-align: left;
    }

    /* Start button resizing */

    @media (max-width: 540px) {
        :global(.buttonHolder .selectionButtons) {
            font-size: 0.6em;
        }
    }

    @media (max-width: 415px) {
        :global(.buttonHolder .selectionButtons) {
            font-size: 0.5em;
            padding: 0 6px;
        }
    }

    @media (max-width: 315px) {
        :global(.buttonHolder .selectionButtons) {
            font-size: 0.45em;
            padding: 0 3px;
        }
    }

    /* End button resizing */

    /* Start record table resizing */

    @media (max-width: 510px) {
        :global(.recordTable th) {
            font-size: 0.8em;
            padding: 1px 5px;
        }
        :global(.recordTable td) {
            font-size: 0.8em;
            padding: 1px 12px;
        }
    }

    @media (max-width: 435px) {
        :global(.rank) {
            padding: 1px 0 1px 5px !important;
        }
        :global(.rank) {
            padding: 1px 0 1px 5px !important;
        }
    }

    @media (max-width: 420px) {
        :global(.recordTable th) {
            font-size: 0.6em;
            padding: 1px 5px;
        }
        :global(.recordTable td) {
            font-size: 0.6em;
            padding: 1px 12px;
        }
    }

    @media (max-width: 330px) {
        :global(.recordTable th) {
            font-size: 0.5em;
            padding: 1px 5px;
        }
        :global(.recordTable td) {
            font-size: 0.5em;
            padding: 1px 8px;
        }
    }

    /* END record table resizing */

    /* Start ranking table resizing */

    @media (max-width: 570px) {
        :global(.rankingTable th) {
            font-size: 0.8em;
            max-width: 110px;
            white-space: break-spaces;
            padding: 1px 12px;
        }
        :global(.rankingTable td) {
            font-size: 0.8em;
            max-width: 110px;
            white-space: break-spaces;
            padding: 1px 12px;
        }
    }

    @media (max-width: 410px) {
        :global(.rankingTable th) {
            font-size: 0.6em;
            max-width: 90px;
            white-space: break-spaces;
            padding: 1px 12px;
        }
        :global(.rankingTable td) {
            font-size: 0.6em;
            max-width: 90px;
            white-space: break-spaces;
            padding: 1px 12px;
        }
    }

    @media (max-width: 340px) {
        :global(.rankingTable th) {
            font-size: 0.55em;
            max-width: 80px;
            white-space: break-spaces;
            padding: 1px 6px;
        }
        :global(.rankingTable td) {
            font-size: 0.55em;
            max-width: 80px;
            white-space: break-spaces;
            padding: 1px 6px;
        }
    }

    /* END ranking table resizing */


    .headerRow {
        position: relative;
        display: inline-flex;
        height: 2em;
        width: 100%;
        margin: 1em 0;
        align-items: center;
        justify-content: space-around;
    }

    .headerLabel {
        position: relative;
        display: inline-flex;
        color: var(--gcPlayRowText);
        font-weight: 420;
        font-size: 2em;
        justify-content: center;
    }

    .recordsWrap {
        position: relative;
        display: inline-flex;
        flex-direction: row;
        width: 100%;
        justify-content: center;
    }

    .columnWrap {
        position: relative;
        display: inline-flex;
        flex-direction: column;
        width: 48%;
        padding: 1%;
        align-items: center;
    }

    .headToHeadWrap {
        position: relative;
        display: inline-flex;
        flex-direction: row;
        justify-content: center;
        width: 79.5%;
        height: 50em;
        background-color: var(--gcBox);
        padding: 0.25%;
    }

    .headToHeadChoices {
        position: relative;
        display: inline-flex;
        flex-direction: column;
        width: 19.5%;
        margin: 0.25%;
        background-color: var(--gcComponent);
        justify-content: space-evenly;
    }

    .headToHeadMain {
        position: relative;
        display: inline-flex;
        width: 100%;
        height: 28%;
        background-color: var(--gcComponent);
    }

    .headToHeadRow {
        position: relative;
        display: inline-flex;
        color: var(--gcPlayRowText);
        width: 90%;
        padding: 0 4%;
        height: 2.5em;
        align-items: center;
    }

    .headToHeadRow:hover {
        cursor: pointer;
        background-color: var(--gcSelect);
        border: 0.1em solid var(--g111);
        height: 2.5em;
        width: 90%;
    }

    .managerAvatar {
        display: inline-flex;
        flex-direction: row;
        position: relative;
        border: 0.25px solid #777; 
        border-radius: 50%; 
        height: 90%; 
        width: auto;
        margin: 0 2%;
    }

    .managerName {
        display: inline-flex;
        position: relative;
        flex-direction: column;
        justify-content: center;
    }

    .managerProfile {
        display: inline-flex;
        position: relative;
        height: 40%;
        width: 100%;
        align-items: center;
        justify-content: center;
    }

    .headToHeadSummaryWrap {
        display: inline-flex;
        position: relative;
        height: 60%;
        width: 100%;
    }

    .headToHeadSummaryText {
        display: inline-flex;
        position: relative;
        width: 100%;
        font-size: 0.85em;
        line-height: 1em;
        justify-content: flex-start;
    }

    .headToHeadSummaryHeader {
        display: inline-flex;
        position: relative;
        width: 100%;
        justify-content: center;
    }

    .matchupHolder {
        display: inline-flex;
        position: relative;
        background-color: var(--gcComponent);
        width: 100%;
        height: 100%;
        flex-wrap: nowrap;
		transition: margin-left 0.8s;
    }

    .matchupWrap {
        display: block;
        width: 100%;
        height: 68%;
        overflow-x: hidden;
    }

    .matchupSwitcher {
        display: inline-flex;
        position: relative;
        background-color: var(--gcComponent);
        width: 100%;
        height: 5%;
        padding: 1% 0;
        border-top: 0.1em dashed var(--gcBox);
        align-items: center;
        justify-content: space-between;
        color: var(--gcPlayRowText);
        font-size: 1.4em;
    }

    .headingText {
        display: inline-flex;
        position: relative;
        font-size: 1em;
        font-weight: 450;
        width: 50%;
        color: var(--gcPlayRowText);
        justify-content: center;
    }

    :global(.changeMatchup) {
        display: inline-flex;
        position: relative;
        justify-content: center;
        font-size: 2.5em;
        cursor: pointer;
        color: #888;
        width: 25%;
    }

    :global(.changeMatchup:hover) {
        color: #00316b;
    }

    .spacer {
        width: 25%;
    }

    .matchup {
        position: relative;
        display: inline-flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        border-radius: 1em;
        background-color: var(--gcComponent);
        align-self: center;
        /* box-shadow: inset 0px 3px 3px -2px rgb(0 0 0 / 30%), inset 0px 3px 4px 0px rgb(0 0 0 / 28%), inset 0px 1px 4px 3px var(--gcScoreShadow); */
    }

    :global(.changeSort) {
        position: absolute;
        margin: 2px 0 0 7px;
        font-size: 1.05em;
        cursor: pointer;
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

    .pos {
        display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 7px;
        max-width: 28px;
        min-width: 28px;
		height: 28px;
    }

    .teamAvatar {
        display: inline-flex;
		align-items: center;
		justify-content: center;
        height: 35px;
        max-height: 35px;
    }

</style>

<div class="buttonHolder">
    <Group variant="outlined">
        <Button class="selectionButtons" on:click={() => selection = 'regular'} variant="{selection == 'regular' ? "raised" : "outlined"}">
            <Label>Regular Season</Label>
        </Button>
        <Button class="selectionButtons" on:click={() => selection = 'playoffs'} variant="{selection == 'playoffs' ? "raised" : "outlined"}">
            <Label>Playoffs</Label>
        </Button>
        <Button class="selectionButtons" on:click={() => selection = 'combined'} variant="{selection == 'combined' ? "raised" : "outlined"}">
            <Label>Combined</Label>
        </Button>
    </Group>
</div>

<div class="headerRow">
    {#if allTime}
        <div class="headerLabel">Weeks</div>
        <div class="headerLabel">Seasons</div>
    {:else}
        <div class="headerLabel" style="justify-content: center">Weeks</div>
    {/if}
</div>

<div class="recordsWrap">
    <div class="columnWrap" style="{!allTime ? "width: 98%;" : null}">
        <div class="buttonHolder">
            <Group variant="outlined">
                <Button class="selectionButtons" on:click={() => displayWeekRecord = 'high'} variant="{displayWeekRecord == 'high' ? "raised" : "outlined"}">
                    <Label>Highest</Label>
                </Button>
                <Button class="selectionButtons" on:click={() => displayWeekRecord = 'low'} variant="{displayWeekRecord == 'low' ? "raised" : "outlined"}">
                    <Label>Lowest</Label>
                </Button>
            </Group>
        </div>
        {#if displayWeekRecord == 'high'}
            {#if weekRecords && weekRecords.length}
                <DataTable class="recordTable" style="width: 450px;">
                    <Head>
                        <Row>
                            <Cell class="header" colspan=5>
                                <p>
                                    Top 10 Week Scores<br>
                                    {prefix} – {recordPrefix} 
                                </p>
                            </Cell>
                        </Row>
                        <Row>
                            <Cell class="header rank"></Cell>
                            <Cell class="header">Manager</Cell>
                            {#if allTime}
                                <Cell class="header">Year</Cell>
                            {/if}
                            <Cell class="header">Week</Cell>
                            <Cell class="header">PF</Cell>
                        </Row>
                    </Head>
                    <Body>
                        {#each weekRecords as leagueWeekRecord, ix}
                            <Row>
                                <Cell class="rank">{ix + 1}</Cell>
                                <Cell class="cellName" on:click={() => gotoManager(leagueWeekRecord.recordManID)}>
                                    {leagueWeekRecord.manager.realname}
                                    {#if !allTime}
                                        <div class="fantasyTeamName">({leagueWeekRecord.manager.name})</div>
                                    {/if}
                                </Cell>
                                {#if allTime}
                                    <Cell class="center">{leagueWeekRecord.year}</Cell>
                                {/if}
                                <Cell class="center">{leagueWeekRecord.week}</Cell>
                                <Cell class="center">{round(leagueWeekRecord.fpts.starters.real)}</Cell>
                            </Row>
                        {/each}
                    </Body>
                </DataTable>
            {/if}
        {:else if displayWeekRecord == 'low'}
            {#if weekRecords && weekRecords.length}
                <DataTable class="recordTable" style="width: 450px;">
                    <Head>
                        <Row>
                            <Cell class="header" colspan=5>
                                <p>
                                    Top 10 Lowest Week Scores<br>
                                    {prefix} – {recordPrefix} 
                                </p>
                            </Cell>                
                        </Row>
                        <Row>
                            <Cell class="header rank"></Cell>
                            <Cell class="header">Manager</Cell>
                            {#if allTime}
                                <Cell class="header">Year</Cell>
                            {/if}
                            <Cell class="header">Week</Cell>
                            <Cell class="header">PF</Cell>
                        </Row>
                    </Head>
                    <Body>
                        {#each weekLows as leagueWeekLow, ix}
                            <Row>
                                <Cell class="rank">{ix + 1}</Cell>
                                <Cell class="cellName" on:click={() => gotoManager(leagueWeekLow.recordManID)}>
                                    {leagueWeekLow.manager.realname}
                                    {#if !allTime}
                                        <div class="fantasyTeamName">({leagueWeekLow.manager.name})</div>
                                    {/if}
                                </Cell>
                                {#if allTime}
                                    <Cell class="center">{leagueWeekLow.year}</Cell>
                                {/if}
                                <Cell class="center">{leagueWeekLow.week}</Cell>
                                <Cell class="center">{round(leagueWeekLow.fpts.starters.real)}</Cell>
                            </Row>
                        {/each}
                    </Body>
                </DataTable>
            {/if}
        {/if}
    </div>
    {#if allTime}
        <div class="columnWrap">
            <div class="buttonHolder">
                <Group variant="outlined">
                    <Button class="selectionButtons" on:click={() => displaySeasonRecord = 'high'} variant="{displaySeasonRecord == 'high' ? "raised" : "outlined"}">
                        <Label>Highest</Label>
                    </Button>
                    <Button class="selectionButtons" on:click={() => displaySeasonRecord = 'low'} variant="{displaySeasonRecord == 'low' ? "raised" : "outlined"}">
                        <Label>Lowest</Label>
                    </Button>
                </Group>
            </div>
            {#if displaySeasonRecord == 'high'}
                <DataTable class="recordTable" style="width: 450px;">
                    <Head>
                        <Row>
                            <Cell class="header" colspan=5>
                                <p>
                                    Top 10 Season-Long Scores<br>
                                    {prefix} – {recordPrefix} 
                                </p>
                            </Cell>
                        </Row>
                        <Row>
                            <Cell class="header rank"></Cell>
                            <Cell class="header">Manager</Cell>
                            <Cell class="header">Year</Cell>
                            <Cell class="header">
                                PF
                                <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.periodHighs, seasonLongRecords, 'real')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                PPG
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.periodHighs, seasonLongRecords, 'realPPG')}>filter_list</Icon>
                            </Cell>
                        </Row>
                    </Head>
                    <Body>
                        {#each seasonLongRecords as seasonLongRecord, ix (rand * (ix + 1))}
                            {#if rand == 0}
                                nothing
                            {:else}
                                <Row>
                                    <Cell class="rank">{ix + 1}</Cell>
                                    <Cell class="cellName" on:click={() => gotoManager(seasonLongRecord.recordManID)}>
                                        {seasonLongRecord.manager.realname}
                                        {#if !allTime}
                                        <div class="fantasyTeamName">({seasonLongRecord.manager.name})</div>
                                        {/if}
                                    </Cell>
                                    <Cell class="center">{seasonLongRecord.year}</Cell>
                                    <Cell class="center">{round(seasonLongRecord.fpts.starters.real)}</Cell>
                                    <Cell class="center">{round(seasonLongRecord.fpts.starters.realPPG)}</Cell>
                                </Row>
                            {/if}
                        {/each}
                    </Body>
                </DataTable>
            {:else if displaySeasonRecord == 'low'}
                <DataTable class="recordTable" style="width: 450px;">
                    <Head>
                        <Row>
                            <Cell class="header" colspan=5>
                                <p>
                                    Top 10 Lowest Season-Long Scores<br>
                                    {prefix} – {recordPrefix} 
                                </p>
                            </Cell>                  
                        </Row>
                        <Row>
                            <Cell class="header rank"></Cell>
                            <Cell class="header">Manager</Cell>
                            <Cell class="header">Year</Cell>
                            <Cell class="header">
                                PF
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.periodLows, seasonLongLows, 'real')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                PPG
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.periodLows, seasonLongLows, 'realPPG')}>filter_list</Icon>
                            </Cell>
                        </Row>
                    </Head>
                    <Body>
                        {#each seasonLongLows as seasonLongLow, ix (rand * (ix + 1))}
                            {#if rand == 0}
                                nothing
                            {:else}
                                <Row>
                                    <Cell class="rank">{ix + 1}</Cell>
                                    <Cell class="cellName" on:click={() => gotoManager(seasonLongLow.recordManID)}>
                                        {seasonLongLow.manager.realname}
                                        {#if !allTime}
                                            <div class="fantasyTeamName">({seasonLongLow.manager.name})</div>
                                        {/if}
                                    </Cell>
                                    <Cell class="center">{seasonLongLow.year}</Cell>
                                    <Cell class="center">{round(seasonLongLow.fpts.starters.real)}</Cell>
                                    <Cell class="center">{round(seasonLongLow.fpts.starters.realPPG)}</Cell>
                                </Row>
                            {/if}
                        {/each}
                    </Body>
                </DataTable>
            {/if}
        </div>
    {/if}
</div>

<div class="headerRow">
        <div class="headerLabel" style="justify-content: center">{marginRecordHeading}</div>
</div>

<div class="recordsWrap">
    <div class="columnWrap" style="width: 98%;">
        <div class="buttonHolder">
            <Group variant="outlined">
                <Button class="selectionButtons" on:click={() => displayMarginRecord = 'blowout'} variant="{displayMarginRecord == 'blowout' ? "raised" : "outlined"}">
                    <Label>Blowouts</Label>
                </Button>
                <Button class="selectionButtons" on:click={() => displayMarginRecord = 'narrow'} variant="{displayMarginRecord == 'narrow' ? "raised" : "outlined"}">
                    <Label>Nailbiters</Label>
                </Button>
            </Group>
        </div>
        {#if displayMarginRecord == 'blowout'}
            {#if blowouts && blowouts.length}
                <DataTable class="recordTable" style="width: 900px;">
                    <Head>
                        <Row>
                            <Cell class="header" colspan=9>
                                <p>
                                    Top 10 Biggest Blowouts<br>
                                    {prefix} – {recordPrefix} 
                                </p>
                            </Cell>                  
                        </Row>
                        <Row>
                            <Cell class="header rank"></Cell>
                            <Cell class="header">Winner</Cell>
                            <Cell class="header">PF</Cell>
                            <Cell class="header rank"></Cell>
                            <Cell class="header">Loser</Cell>
                            <Cell class="header">PF</Cell>
                            {#if allTime}
                                <Cell class="header">Year</Cell>
                            {/if}
                            <Cell class="header">Week</Cell>
                            <Cell class="header">Diff</Cell>
                        </Row>
                    </Head>
                    <Body>
                        {#each blowouts as blowout, ix}
                            <Row>
                                <Cell class="rank">{ix + 1}</Cell>
                                <Cell class="cellName" style="background-color: #229bd924;" on:click={() => gotoManager(blowout.recordManID)}>
                                    {blowout.manager.realname}
                                    {#if !allTime}
                                        <div class="fantasyTeamName">({blowout.manager.name})</div>
                                    {/if}
                                </Cell>
                                <Cell class="center" style="background-color: #0182c326;">{round(blowout.fpts.starters.real)}</Cell>
                                <Cell class="center">vs</Cell>
                                <Cell class="cellName" style="background-color: #7a7a7a33;" on:click={() => gotoManager(blowout.oppRecordManID)}>
                                    {blowout.oppManager.realname}
                                    {#if !allTime}
                                        <div class="fantasyTeamName">({blowout.oppManager.name})</div>
                                    {/if}
                                </Cell>
                                <Cell class="center" style="background-color: #6a6a6a33;">{round(blowout.fpts.opp.real)}</Cell>
                                {#if allTime}
                                    <Cell class="center">{blowout.year}</Cell>
                                {/if}
                                <Cell class="center">{blowout.week}</Cell>
                                <Cell class="center">{round(blowout.matchDifferential)}</Cell>
                            </Row>
                        {/each}
                    </Body>
                </DataTable>
            {/if}
        {:else if displayMarginRecord == 'narrow'}
            {#if closestMatchups && closestMatchups.length}
                <DataTable class="recordTable" style="width: 900px;">
                    <Head>
                        <Row>
                            <Cell class="header" colspan=9>
                                <p>
                                    Top 10 Narrowest Victories<br>
                                    {prefix} – {recordPrefix} 
                                </p>
                            </Cell>                  
                        </Row>
                        <Row>
                            <Cell class="header rank"></Cell>
                            <Cell class="header">Winner</Cell>
                            <Cell class="header">PF</Cell>
                            <Cell class="header rank"></Cell>
                            <Cell class="header">Loser</Cell>
                            <Cell class="header">PF</Cell>
                            {#if allTime}
                                <Cell class="header">Year</Cell>
                            {/if}
                            <Cell class="header">Week</Cell>
                            <Cell class="header">Diff</Cell>
                        </Row>
                    </Head>
                    <Body>
                        {#each closestMatchups as closestMatchup, ix}
                            <Row>
                                <Cell class="rank">{ix + 1}</Cell>
                                <Cell class="cellName" style="background-color: #229bd924;" on:click={() => gotoManager(closestMatchup.recordManID)}>
                                    {closestMatchup.manager.realname}
                                    {#if !allTime}
                                        <div class="fantasyTeamName">({closestMatchup.manager.name})</div>
                                    {/if}
                                </Cell>
                                <Cell class="center" style="background-color: #0182c326;">{round(closestMatchup.fpts.starters.real)}</Cell>
                                <Cell class="center">vs</Cell>
                                <Cell class="cellName" style="background-color: #7a7a7a33;" on:click={() => gotoManager(closestMatchup.oppRecordManID)}>
                                    {closestMatchup.oppManager.realname}
                                    {#if !allTime}
                                        <div class="fantasyTeamName">({closestMatchup.oppManager.name})</div>
                                    {/if}
                                </Cell>
                                <Cell class="center" style="background-color: #6a6a6a33;">{round(closestMatchup.fpts.opp.real)}</Cell>
                                {#if allTime}
                                    <Cell class="center">{closestMatchup.year}</Cell>
                                {/if}
                                <Cell class="center">{closestMatchup.week}</Cell>
                                <Cell class="center">{round(closestMatchup.matchDifferential)}</Cell>
                            </Row>
                        {/each}
                    </Body>
                </DataTable>
            {/if}
        {/if}
    </div>
</div>

<div class="headerRow">
    <div class="headerLabel" style="justify-content: center">Players</div>
</div>

<div class="recordsWrap">
    <div class="columnWrap" style="width: 98%;">
        <div class="buttonHolder">
            <Group variant="outlined">
                <Button class="selectionButtons" on:click={() => displayPlayerRecord = 'overall'} variant="{displayPlayerRecord == 'overall' ? "raised" : "outlined"}">
                    <Label>Overall</Label>
                </Button>
                <Button class="selectionButtons" on:click={() => displayPlayerRecord = 'week'} variant="{displayPlayerRecord == 'week' ? "raised" : "outlined"}">
                    <Label>Week</Label>
                </Button>
                <Button class="selectionButtons" on:click={() => displayPlayerRecord = 'season'} variant="{displayPlayerRecord == 'season' ? "raised" : "outlined"}">
                    <Label>Season</Label>
                </Button>
                <Button class="selectionButtons" on:click={() => displayPlayerRecord = 'breakouts'} variant="{displayPlayerRecord == 'breakouts' ? "raised" : "outlined"}">
                    <Label>Breakouts</Label>
                </Button>
                <Button class="selectionButtons" on:click={() => displayPlayerRecord = 'busts'} variant="{displayPlayerRecord == 'busts' ? "raised" : "outlined"}">
                    <Label>Busts</Label>
                </Button>
                <Button class="selectionButtons" on:click={() => displayPlayerRecord = 'bench'} variant="{displayPlayerRecord == 'bench' ? "raised" : "outlined"}">
                    <Label>Benchwarmers</Label>
                </Button>
            </Group>
        </div>
        <div class="buttonHolder" style="margin: 0.5em 0;">
            <Group variant="outlined">
                <Button class="selectionButtons" on:click={() => displayPositionRecord = 'ALL'} variant="{displayPositionRecord == 'ALL' ? "raised" : "outlined"}">
                    <Label>ALL</Label>
                </Button>
                {#each positions as position}
                    <Button class="selectionButtons" on:click={() => displayPositionRecord = position} variant="{displayPositionRecord == position ? "raised" : "outlined"}">
                        <Label>{position}</Label>
                    </Button>
                {/each}
            </Group>
        </div>
        {#if displayPlayerRecord == 'overall'}
            {#if gamesTOPS && gamesTOPS.length}
                <DataTable class="recordTable">
                    <Head>
                        <Row>
                            <Cell class="header" colspan=13>
                                <p>
                                    Most Weeks Started – {displayPositionRecord == 'ALL' ? 'Players' : displayPositionRecord}<br>
                                    {prefix} – {recordPrefix} 
                                </p>
                            </Cell>                  
                        </Row>
                        <Row>
                            <Cell class="header rank"></Cell>
                            <Cell class="header rank" />
                            <Cell class="header">Player</Cell>
                            {#if displayPositionRecord == 'ALL'}
                                <Cell class="header">POS</Cell>
                            {/if}
                            <Cell class="header">NFL Team</Cell>
                            <Cell class="header">Manager</Cell>
                            {#if allTime}
                                <Cell class="header">Seasons</Cell>
                            {/if}
                            <Cell class="header">
                                Led 
                                <br>
                                Team                                
                                <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.players.gamesHighs, gamesTOPS, 'topStarters', [])}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Team
                                <br> 
                                Bust
                                <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.players.gamesHighs, gamesTOPS, 'bottomStarters', [])}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Average 
                                <br>
                                Team Rank                                
                                <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.players.gamesHighs, gamesTOPS, 'starterRankAVG', [], true)}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                PF
                                <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.players.gamesHighs, gamesTOPS, 'real', ['fpts', 'starters'])}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                PPG
                                <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.players.gamesHighs, gamesTOPS, 'realPPG', ['fpts', 'starters'])}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Starts
                                <br>
                                / Owned
                                <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.players.gamesHighs, gamesTOPS, 'starters', ['weeks'])}>filter_list</Icon>
                            </Cell>
                        </Row>
                    </Head>
                    <Body>
                        {#each gamesTOPS as player, ix (rand * (ix + 1))}
                            {#if rand == 0}
                                nothing
                            {:else}
                                <Row>
                                    <Cell class="rank">{ix + 1}</Cell>
                                    <Cell class="playerAvatar playerInfo" style="background-image: url('{player.avatar}'); vertical-align: middle; height: 45px; width: 45px; background-position: center; background-repeat: no-repeat; background-size: auto 45px;" />
                                    <Cell class="left">{player.playerInfo.fn} {player.playerInfo.ln}</Cell>
                                    {#if displayPositionRecord == 'ALL'}
                                        <Cell class="center">
                                            <div class="pos {player.playerInfo.pos}">
                                                {player.playerInfo.pos}
                                            </div>
                                        </Cell>
                                    {/if}
                                    <Cell class="center">
                                        <img class="teamAvatar" src="https://sleepercdn.com/images/team_logos/nfl/{player.team.toLowerCase()}.png" alt="{player.team}">
                                    </Cell>
                                    <Cell class="cellName" on:click={() => gotoManager(player.recordManID)}>
                                        {player.manager.realname}
                                        {#if !allTime}
                                            <div class="fantasyTeamName">({player.manager.name})</div>
                                        {/if}
                                    </Cell>
                                    {#if allTime}
                                        <Cell class="center">{player.years.total}</Cell>
                                    {/if}
                                    <Cell class="center">{player.topStarters}</Cell>
                                    <Cell class="center">{player.bottomStarters}</Cell>
                                    <Cell class="center">{round(player.starterRankAVG)}</Cell>
                                    <Cell class="center">{round(player.fpts.starters.real)}</Cell>
                                    <Cell class="center">{round(player.fpts.starters.realPPG)}</Cell>
                                    <Cell class="center">{player.weeks.starters} / {player.weeks.total}</Cell>
                                </Row>
                            {/if}
                        {/each}
                    </Body>
                </DataTable>
            {/if}
            
            {#if playerOverallTOPS && playerOverallTOPS.length}
                <DataTable class="recordTable">
                    <Head>
                        <Row>
                            <Cell class="header" colspan=13>
                                <p>
                                    Top Cumulative Scorers – {displayPositionRecord == 'ALL' ? 'Players' : displayPositionRecord}<br>
                                    {prefix} – {recordPrefix} 
                                </p>
                            </Cell>                  
                        </Row>
                        <Row>
                            <Cell class="header rank"></Cell>
                            <Cell class="header rank" />
                            <Cell class="header">Player</Cell>
                            {#if displayPositionRecord == 'ALL'}
                                <Cell class="header">POS</Cell>
                            {/if}
                            <Cell class="header">NFL Team</Cell>
                            <Cell class="header">Manager</Cell>
                            {#if allTime}
                                <Cell class="header">Seasons</Cell>
                            {/if}
                            <Cell class="header">
                                Led 
                                <br>
                                Team
                                <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.players.overallHighs, playerOverallTOPS, 'topStarters', [])}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Team 
                                <br>
                                Bust
                                <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.players.overallHighs, playerOverallTOPS, 'bottomStarters', [])}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Avgerage 
                                <br>
                                Team Rank
                                <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.players.overallHighs, playerOverallTOPS, 'starterRankAVG', [], true)}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Starts
                                <br>
                                / Owned
                                <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.players.overallHighs, playerOverallTOPS, 'starters', ['weeks'])}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                PF
                                <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.players.overallHighs, playerOverallTOPS, 'real', ['fpts', 'starters'])}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                PPG
                                <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.players.overallHighs, playerOverallTOPS, 'realPPG', ['fpts', 'starters'])}>filter_list</Icon>
                            </Cell>
                        </Row>
                    </Head>
                    <Body>
                        {#each playerOverallTOPS as player, ix (rand * (ix + 1))}
                            {#if rand == 0}
                                nothing
                            {:else}
                                <Row>
                                    <Cell class="rank">{ix + 1}</Cell>
                                    <Cell class="playerAvatar playerInfo" style="background-image: url('{player.avatar}'); vertical-align: middle; height: 45px; width: 45px; background-position: center; background-repeat: no-repeat; background-size: auto 45px;" />
                                    <Cell class="left">{player.playerInfo.fn} {player.playerInfo.ln}</Cell>
                                    {#if displayPositionRecord == 'ALL'}
                                        <Cell class="center">
                                            <div class="pos {player.playerInfo.pos}">
                                                {player.playerInfo.pos}
                                            </div>
                                        </Cell>
                                    {/if}
                                    <Cell class="center">
                                        <img class="teamAvatar" src="https://sleepercdn.com/images/team_logos/nfl/{player.team.toLowerCase()}.png" alt="{player.team}">
                                    </Cell>
                                    <Cell class="cellName" on:click={() => gotoManager(player.recordManID)}>
                                        {player.manager.realname}
                                        {#if !allTime}
                                            <div class="fantasyTeamName">({player.manager.name})</div>
                                        {/if}
                                    </Cell>
                                    {#if allTime}
                                        <Cell class="center">{player.years.total}</Cell>
                                    {/if}
                                    <Cell class="center">{player.topStarters}</Cell>
                                    <Cell class="center">{player.bottomStarters}</Cell>
                                    <Cell class="center">{round(player.starterRankAVG)}</Cell>
                                    <Cell class="center">{player.weeks.starters} / {player.weeks.total}</Cell>
                                    <Cell class="center">{round(player.fpts.starters.real)}</Cell>
                                    <Cell class="center">{round(player.fpts.starters.realPPG)}</Cell>
                                </Row>
                            {/if}
                        {/each}
                    </Body>
                </DataTable>
            {/if}
        {:else if displayPlayerRecord == 'week'}
            {#if playerWeekTOPS && playerWeekTOPS.length}
                <DataTable class="recordTable">
                    <Head>
                        <Row>
                            <Cell class="header" colspan=9>
                                <p>
                                    Top 10 Week Scores - {displayPositionRecord == 'ALL' ? 'Players' : displayPositionRecord}<br>
                                    {prefix} – {recordPrefix} 
                                </p>
                            </Cell>                  
                        </Row>
                        <Row>
                            <Cell class="header rank"></Cell>
                            <Cell class="header rank" />
                            <Cell class="header">Player</Cell>
                            {#if displayPositionRecord == 'ALL'}
                                <Cell class="header">POS</Cell>
                            {/if}
                            <Cell class="header">NFL Team</Cell>
                            <Cell class="header">Manager</Cell>
                            {#if allTime}
                                <Cell class="header">Year</Cell>
                            {/if}
                            <Cell class="header">Week</Cell>
                            <Cell class="header">PF</Cell>
                        </Row>
                    </Head>
                    <Body>
                        {#each playerWeekTOPS as playerATWeekTOP, ix}
                            <Row>
                                <Cell class="rank">{ix + 1}</Cell>
                                <Cell class="playerAvatar playerInfo" style="background-image: url('{playerATWeekTOP.avatar}'); vertical-align: middle; height: 45px; width: 45px; background-position: center; background-repeat: no-repeat; background-size: auto 45px;" />
                                <Cell class="left">{playerATWeekTOP.playerInfo.fn} {playerATWeekTOP.playerInfo.ln}</Cell>
                                {#if displayPositionRecord == 'ALL'}
                                    <Cell class="center">
                                        <div class="pos {playerATWeekTOP.playerInfo.pos}">
                                            {playerATWeekTOP.playerInfo.pos}
                                        </div>
                                    </Cell>
                                {/if}
                                <Cell class="center">
                                    <img class="teamAvatar" src="https://sleepercdn.com/images/team_logos/nfl/{playerATWeekTOP.team.toLowerCase()}.png" alt="{playerATWeekTOP.team}">
                                </Cell>
                                <Cell class="cellName" on:click={() => gotoManager(playerATWeekTOP.recordManID)}>
                                    {playerATWeekTOP.manager.realname}
                                    {#if !allTime}
                                        <div class="fantasyTeamName">({playerATWeekTOP.manager.name})</div>
                                    {/if}
                                </Cell>
                                {#if allTime}
                                    <Cell class="center">{playerATWeekTOP.year}</Cell>
                                {/if}
                                <Cell class="center">{playerATWeekTOP.week}</Cell>
                                <Cell class="center">{round(playerATWeekTOP.fpts)}</Cell>
                            </Row>
                        {/each}
                    </Body>
                </DataTable>
            {/if}
        {:else if displayPlayerRecord == 'season'}
            {#if playerSeasonTOPS && playerSeasonTOPS.length}
                <DataTable class="recordTable">
                    <Head>
                        <Row>
                            <Cell class="header" colspan=13>
                                <p>
                                    Top 10 Season-Long Scores – {displayPositionRecord == 'ALL' ? 'Players' : displayPositionRecord}<br>
                                    {prefix} – {recordPrefix} 
                                </p>
                            </Cell>                  
                        </Row>
                        <Row>
                            <Cell class="header rank"></Cell>
                            <Cell class="header rank" />
                            <Cell class="header">Player</Cell>
                            {#if displayPositionRecord == 'ALL'}
                                <Cell class="header">POS</Cell>
                            {/if}
                            <Cell class="header">NFL Team</Cell>
                            <Cell class="header">Manager</Cell>
                            {#if allTime}
                                <Cell class="header">Year</Cell>
                            {/if}
                            <Cell class="header">
                                Led 
                                <br>
                                Team
                                <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.players.periodHighs, playerSeasonTOPS, 'topStarters', [])}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Team 
                                <br>
                                Bust
                                <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.players.periodHighs, playerSeasonTOPS, 'bottomStarters', [])}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Average 
                                <br>
                                Team Rank
                                <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.players.periodHighs, playerSeasonTOPS, 'starterRankAVG', [], true)}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Starts
                                <br>
                                / Owned
                                <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.players.periodHighs, playerSeasonTOPS, 'starters', ['weeks'])}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                PF
                                <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.players.periodHighs, playerSeasonTOPS, 'real', ['fpts', 'starters'])}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                PPG
                                <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.players.periodHighs, playerSeasonTOPS, 'realPPG', ['fpts', 'starters'])}>filter_list</Icon>
                            </Cell>
                        </Row>
                    </Head>
                    <Body>
                        {#each playerSeasonTOPS as playerATSeasonTOP, ix (rand * (ix + 1))}
                            {#if rand == 0}
                                nothing
                            {:else}
                                <Row>
                                    <Cell class="rank">{ix + 1}</Cell>
                                    <Cell class="playerAvatar playerInfo" style="background-image: url('{playerATSeasonTOP.avatar}'); vertical-align: middle; height: 45px; width: 45px; background-position: center; background-repeat: no-repeat; background-size: auto 45px;" />
                                    <Cell class="left">{playerATSeasonTOP.playerInfo.fn} {playerATSeasonTOP.playerInfo.ln}</Cell>
                                    {#if displayPositionRecord == 'ALL'}
                                        <Cell class="center">
                                            <div class="pos {playerATSeasonTOP.playerInfo.pos}">
                                                {playerATSeasonTOP.playerInfo.pos}
                                            </div>
                                        </Cell>
                                    {/if}
                                    <Cell class="center">
                                        <img class="teamAvatar" src="https://sleepercdn.com/images/team_logos/nfl/{playerATSeasonTOP.team.toLowerCase()}.png" alt="{playerATSeasonTOP.team}">
                                    </Cell>
                                    <Cell class="cellName" on:click={() => gotoManager(playerATSeasonTOP.recordManID)}>
                                        {playerATSeasonTOP.manager.realname}
                                        {#if !allTime}
                                            <div class="fantasyTeamName">({playerATSeasonTOP.manager.name})</div>
                                        {/if}
                                    </Cell>
                                    {#if allTime}
                                        <Cell class="center">{playerATSeasonTOP.year}</Cell>
                                    {/if}
                                    <Cell class="center">{playerATSeasonTOP.topStarters}</Cell>
                                    <Cell class="center">{playerATSeasonTOP.bottomStarters}</Cell>
                                    <Cell class="center">{round(playerATSeasonTOP.starterRankAVG)}</Cell>
                                    <Cell class="center">{playerATSeasonTOP.weeks.starters} / {playerATSeasonTOP.weeks.total}</Cell>
                                    <Cell class="center">{round(playerATSeasonTOP.fpts.starters.real)}</Cell>
                                    <Cell class="center">{round(playerATSeasonTOP.fpts.starters.realPPG)}</Cell>
                                </Row>
                            {/if}
                        {/each}
                    </Body>
                </DataTable>
            {/if}
        {:else if displayPlayerRecord == 'breakouts'}
            {#if seasonOvers && seasonOvers.length}
                <DataTable class="recordTable">
                    <Head>
                        <Row>
                            <Cell class="header" colspan=14>
                                <p>
                                    Biggest Season-Long Breakouts – {displayPositionRecord == 'ALL' ? 'Players' : displayPositionRecord}<br>
                                    {prefix} – {recordPrefix} 
                                </p>
                            </Cell>  
                        </Row>
                        <Row>
                            <Cell class="header rank"></Cell>
                            <Cell class="header rank" />
                            <Cell class="header">Player</Cell>
                            <Cell class="header">POS</Cell>
                            <Cell class="header">NFL Team</Cell>
                            <Cell class="header">Manager</Cell>
                            {#if allTime}
                                <Cell class="header">Year</Cell>
                            {/if}
                            <Cell class="header">
                                Led 
                                <br>
                                Team
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.seasonOvers, seasonOvers, 'topStarters', [])}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Team 
                                <br>
                                Bust
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.seasonOvers, seasonOvers, 'bottomStarters', [])}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Average
                                <br>
                                Team Rank
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.seasonOvers, seasonOvers, 'starterRankAVG', [], true)}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Starts
                                <br>
                                / Owned
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.seasonOvers, seasonOvers, 'starters', ['weeks'])}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                PF
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.seasonOvers, seasonOvers, 'real', ['fpts', 'starters'])}>filter_list</Icon>
                                <br>
                                (PPG)
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.seasonOvers, seasonOvers, 'realPPG', ['fpts', 'starters'])}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Proj PF
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.seasonOvers, seasonOvers, 'proj', ['fpts', 'starters'])}>filter_list</Icon>
                                <br>
                                (PPG)
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.seasonOvers, seasonOvers, 'projPPG', ['fpts', 'starters'])}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Diff
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.seasonOvers, seasonOvers, 'diff', ['fpts', 'starters'])}>filter_list</Icon>
                                <br>
                                Diff PG
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.seasonOvers, seasonOvers, 'diffPG', ['fpts', 'starters'])}>filter_list</Icon>
                            </Cell>
                        </Row>
                    </Head>
                    <Body>
                        {#each seasonOvers as seasonBestOver, ix (rand * (ix + 1))}
                            {#if rand == 0}
                                nothing
                            {:else}
                                <Row>
                                    <Cell class="rank">{ix + 1}</Cell>
                                    <Cell class="playerAvatar playerInfo" style="background-image: url('{seasonBestOver.avatar}'); vertical-align: middle; height: 45px; width: 45px; background-position: center; background-repeat: no-repeat; background-size: auto 45px;" />
                                    <Cell class="left">{seasonBestOver.playerInfo.fn} {seasonBestOver.playerInfo.ln}</Cell>
                                    <Cell class="center">
                                        <div class="pos {seasonBestOver.playerInfo.pos}">
                                            {seasonBestOver.playerInfo.pos}
                                        </div>
                                    </Cell>
                                    <Cell class="center">
                                        <img class="teamAvatar" src="https://sleepercdn.com/images/team_logos/nfl/{seasonBestOver.team.toLowerCase()}.png" alt="{seasonBestOver.team}">
                                    </Cell>
                                    <Cell class="cellName" on:click={() => gotoManager(seasonBestOver.recordManID)}>
                                        {seasonBestOver.manager.realname}
                                        {#if !allTime}
                                            <div class="fantasyTeamName">({seasonBestOver.manager.name})</div>
                                        {/if}
                                    </Cell>
                                    {#if allTime}
                                        <Cell class="center">{seasonBestOver.year}</Cell>
                                    {/if}
                                    <Cell class="center">{seasonBestOver.topStarters}</Cell>
                                    <Cell class="center">{seasonBestOver.bottomStarters}</Cell>
                                    <Cell class="center">{round(seasonBestOver.starterRankAVG)}</Cell>
                                    <Cell class="center">{seasonBestOver.weeks.starters} / {seasonBestOver.weeks.total}</Cell>
                                    <Cell class="center">{round(seasonBestOver.fpts.starters.real)} <div style="font-size: 0.9em">{round(seasonBestOver.fpts.starters.realPPG)}</Cell>
                                    <Cell class="center">{round(seasonBestOver.fpts.starters.proj)} <div style="font-size: 0.9em">{round(seasonBestOver.fpts.starters.projPPG)}</Cell>
                                    <Cell class="center">{round(seasonBestOver.fpts.starters.diff)} <div style="font-size: 0.9em">{round(seasonBestOver.fpts.starters.diffPG)}</div></Cell>
                                </Row>
                            {/if}
                        {/each}
                    </Body>
                </DataTable>
            {/if}
    
            {#if weekOvers && weekOvers.length}
                <DataTable class="recordTable">
                    <Head>
                        <Row>
                            <Cell class="header" colspan=11>
                                <p>
                                    Biggest Single-Week Breakouts – {displayPositionRecord == 'ALL' ? 'Players' : displayPositionRecord}<br>
                                    {prefix} – {recordPrefix} 
                                </p>
                            </Cell>  
                        </Row>
                        <Row>
                            <Cell class="header rank"></Cell>
                            <Cell class="header rank" />
                            <Cell class="header">Player</Cell>
                            <Cell class="header">POS</Cell>
                            <Cell class="header">NFL Team</Cell>
                            <Cell class="header">Manager</Cell>
                            {#if allTime}
                                <Cell class="header">Year</Cell>
                            {/if}
                            <Cell class="header">Week</Cell>
                            <Cell class="header">
                                PF
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.weekOvers, weekOvers, 'fpts')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Proj PF
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.weekOvers, weekOvers, 'projFpts')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Diff
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.weekOvers, weekOvers, 'projDiff')}>filter_list</Icon>
                            </Cell>
                        </Row>
                    </Head>
                    <Body>
                        {#each weekOvers as weekBestOver, ix (rand * (ix + 1))}
                            {#if rand == 0}
                                nothing
                            {:else}
                                <Row>
                                    <Cell class="rank">{ix + 1}</Cell>
                                    <Cell class="playerAvatar playerInfo" style="background-image: url('{weekBestOver.avatar}'); vertical-align: middle; height: 45px; width: 45px; background-position: center; background-repeat: no-repeat; background-size: auto 45px;" />
                                    <Cell class="left">{weekBestOver.playerInfo.fn} {weekBestOver.playerInfo.ln}</Cell>
                                    <Cell class="center">
                                        <div class="pos {weekBestOver.playerInfo.pos}">
                                            {weekBestOver.playerInfo.pos}
                                        </div>
                                    </Cell>
                                    <Cell class="center">
                                        <img class="teamAvatar" src="https://sleepercdn.com/images/team_logos/nfl/{weekBestOver.team.toLowerCase()}.png" alt="{weekBestOver.team}">
                                    </Cell>
                                    <Cell class="cellName" on:click={() => gotoManager(weekBestOver.recordManID)}>
                                        {weekBestOver.manager.realname}
                                        {#if !allTime}
                                            <div class="fantasyTeamName">({weekBestOver.manager.name})</div>
                                        {/if}
                                    </Cell>
                                    {#if allTime}
                                        <Cell class="center">{weekBestOver.year}</Cell>
                                    {/if}
                                    <Cell class="center">{weekBestOver.week}</Cell>
                                    <Cell class="center">{round(weekBestOver.fpts)}</Cell>
                                    <Cell class="center">{round(weekBestOver.projFpts)}</Cell>
                                    <Cell class="center">{round(weekBestOver.projDiff)}</Cell>
                                </Row>
                            {/if}
                        {/each}
                    </Body>
                </DataTable>
            {/if}
        {:else if displayPlayerRecord == 'busts'}
            {#if seasonUnders && seasonUnders.length}
                <DataTable class="recordTable">
                    <Head>
                        <Row>
                            <Cell class="header" colspan=14>
                                <p>
                                    Biggest Season-Long Busts – {displayPositionRecord == 'ALL' ? 'Players' : displayPositionRecord}<br>
                                    {prefix} – {recordPrefix} 
                                </p>
                            </Cell>  
                        </Row>
                        <Row>
                            <Cell class="header rank"></Cell>
                            <Cell class="header rank" />
                            <Cell class="header">Player</Cell>
                            <Cell class="header">POS</Cell>
                            <Cell class="header">NFL Team</Cell>
                            <Cell class="header">Manager</Cell>
                            {#if allTime}
                                <Cell class="header">Year</Cell>
                            {/if}
                            <Cell class="header">
                                Led 
                                <br>
                                Team
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.seasonUnders, seasonUnders, 'topStarters', [])}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Team 
                                <br>
                                Bust
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.seasonUnders, seasonUnders, 'bottomStarters', [])}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Average 
                                <br>
                                Rank
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.seasonUnders, seasonUnders, 'starterRankAVG', [], true)}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Starts
                                <br>
                                / Owned
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.seasonUnders, seasonUnders, 'starters', ['weeks'])}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                PF
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.seasonUnders, seasonUnders, 'real', ['fpts', 'starters'])}>filter_list</Icon>
                                <br>
                                (PPG)
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.seasonUnders, seasonUnders, 'realPPG', ['fpts', 'starters'])}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Proj PF
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.seasonUnders, seasonUnders, 'proj', ['fpts', 'starters'])}>filter_list</Icon>
                                <br>
                                (PPG)
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.seasonUnders, seasonUnders, 'projPPG', ['fpts', 'starters'])}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Diff
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.seasonUnders, seasonUnders, 'diff', ['fpts', 'starters'], true)}>filter_list</Icon>
                                <br>
                                (Diff PG)
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.seasonUnders, seasonUnders, 'diffPG', ['fpts', 'starters'], true)}>filter_list</Icon>
                            </Cell>
                        </Row>
                    </Head>
                    <Body>
                        {#each seasonUnders as seasonBestUnder, ix (rand * (ix + 1))}
                            {#if rand == 0}
                                nothing
                            {:else}
                                <Row>
                                    <Cell class="rank">{ix + 1}</Cell>
                                    <Cell class="playerAvatar playerInfo" style="background-image: url('{seasonBestUnder.avatar}'); vertical-align: middle; height: 45px; width: 45px; background-position: center; background-repeat: no-repeat; background-size: auto 45px;" />
                                    <Cell class="left">{seasonBestUnder.playerInfo.fn} {seasonBestUnder.playerInfo.ln}</Cell>
                                    <Cell class="center">
                                        <div class="pos {seasonBestUnder.playerInfo.pos}">
                                            {seasonBestUnder.playerInfo.pos}
                                        </div>
                                    </Cell>
                                    <Cell class="center">
                                        <img class="teamAvatar" src="https://sleepercdn.com/images/team_logos/nfl/{seasonBestUnder.team.toLowerCase()}.png" alt="{seasonBestUnder.team}">
                                    </Cell>
                                    <Cell class="cellName" on:click={() => gotoManager(seasonBestUnder.recordManID)}>
                                        {seasonBestUnder.manager.realname}
                                        {#if !allTime}
                                            <div class="fantasyTeamName">({seasonBestUnder.manager.name})</div>
                                        {/if}
                                    </Cell>
                                    {#if allTime}
                                        <Cell class="center">{seasonBestUnder.year}</Cell>
                                    {/if}
                                    <Cell class="center">{seasonBestUnder.topStarters}</Cell>
                                    <Cell class="center">{seasonBestUnder.bottomStarters}</Cell>
                                    <Cell class="center">{round(seasonBestUnder.starterRankAVG)}</Cell>
                                    <Cell class="center">{seasonBestUnder.weeks.starters} / {seasonBestUnder.weeks.total}</Cell>
                                    <Cell class="center">{round(seasonBestUnder.fpts.starters.real)} <div style="font-size: 0.9em">{round(seasonBestUnder.fpts.starters.realPPG)}</Cell>
                                    <Cell class="center">{round(seasonBestUnder.fpts.starters.proj)} <div style="font-size: 0.9em">{round(seasonBestUnder.fpts.starters.projPPG)}</Cell>
                                    <Cell class="center">{round(seasonBestUnder.fpts.starters.diff)} <div style="font-size: 0.9em">{round(seasonBestUnder.fpts.starters.diffPG)}</div></Cell>
                                </Row>
                            {/if}
                        {/each}
                    </Body>
                </DataTable>
            {/if}
    
            {#if weekUnders && weekUnders.length}
                <DataTable class="recordTable">
                    <Head>
                        <Row>
                            <Cell class="header" colspan=11>
                                <p>
                                    Biggest Single-Week Busts – {displayPositionRecord == 'ALL' ? 'Players' : displayPositionRecord}<br>
                                    {prefix} – {recordPrefix} 
                                </p>
                            </Cell>  
                        </Row>
                        <Row>
                            <Cell class="header rank"></Cell>
                            <Cell class="header rank" />
                            <Cell class="header">Player</Cell>
                            <Cell class="header">POS</Cell>
                            <Cell class="header">NFL Team</Cell>
                            <Cell class="header">Manager</Cell>
                            {#if allTime}
                                <Cell class="header">Year</Cell>
                            {/if}
                            <Cell class="header">Week</Cell>
                            <Cell class="header">
                                PF
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.weekUnders, weekBestUnders, 'fpts')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Proj PF
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.weekUnders, weekBestUnders, 'projFpts')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Diff
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.weekUnders, weekBestUnders, 'projDiff', true)}>filter_list</Icon>
                            </Cell>
                        </Row>
                    </Head>
                    <Body>
                        {#each weekUnders as weekBestUnder, ix (rand * (ix + 1))}
                            {#if rand == 0}
                                nothing
                            {:else}
                                <Row>
                                    <Cell class="rank">{ix + 1}</Cell>
                                    <Cell class="playerAvatar playerInfo" style="background-image: url('{weekBestUnder.avatar}'); vertical-align: middle; height: 45px; width: 45px; background-position: center; background-repeat: no-repeat; background-size: auto 45px;" />
                                    <Cell class="left">{weekBestUnder.playerInfo.fn} {weekBestUnder.playerInfo.ln}</Cell>
                                    <Cell class="center">
                                        <div class="pos {weekBestUnder.playerInfo.pos}">
                                            {weekBestUnder.playerInfo.pos}
                                        </div>
                                    </Cell>
                                    <Cell class="center">
                                        <img class="teamAvatar" src="https://sleepercdn.com/images/team_logos/nfl/{weekBestUnder.team.toLowerCase()}.png" alt="{weekBestUnder.team}">
                                    </Cell>
                                    <Cell class="cellName" on:click={() => gotoManager(weekBestUnder.recordManID)}>
                                        {weekBestUnder.manager.realname}
                                        {#if !allTime}
                                            <div class="fantasyTeamName">({weekBestUnder.manager.name})</div>
                                        {/if}
                                    </Cell>
                                    {#if allTime}
                                        <Cell class="center">{weekBestUnder.year}</Cell>
                                    {/if}
                                    <Cell class="center">{weekBestUnder.week}</Cell>
                                    <Cell class="center">{round(weekBestUnder.fpts)}</Cell>
                                    <Cell class="center">{round(weekBestUnder.projFpts)}</Cell>
                                    <Cell class="center">{round(weekBestUnder.projDiff)}</Cell>
                                </Row>
                            {/if}
                        {/each}
                    </Body>
                </DataTable>
            {/if}
        {:else if displayPlayerRecord == 'bench'}
            {#if playerWeekMissedTOPS && playerWeekMissedTOPS.length}
                <DataTable class="recordTable">
                    <Head>
                        <Row>
                            <Cell class="header" colspan=9>
                                <p>
                                    Top 10 Benchwarmers – {displayPositionRecord == 'ALL' ? 'Players' : displayPositionRecord}<br>
                                    {prefix} – {recordPrefix} 
                                </p>
                            </Cell>                  
                        </Row>
                        <Row>
                            <Cell class="header rank"></Cell>
                            <Cell class="header rank" /> 
                            <Cell class="header">Player</Cell>
                            {#if displayPositionRecord == 'ALL'}
                                <Cell class="header">POS</Cell>
                            {/if}
                            <Cell class="header">NFL Team</Cell>
                            <Cell class="header">Manager</Cell>
                            {#if allTime}
                                <Cell class="header">Year</Cell>
                            {/if}
                            <Cell class="header">Week</Cell>
                            <Cell class="header">PF</Cell>
                        </Row>
                    </Head>
                    <Body>
                        {#each playerWeekMissedTOPS as playerATWeekMissedTOP, ix}
                            <Row>
                                <Cell class="rank">{ix + 1}</Cell>
                                <Cell class="playerAvatar playerInfo" style="background-image: url('{playerATWeekMissedTOP.avatar}'); vertical-align: middle; height: 45px; width: 45px; background-position: center; background-repeat: no-repeat; background-size: auto 45px;" />
                                <Cell class="left">{playerATWeekMissedTOP.playerInfo.fn} {playerATWeekMissedTOP.playerInfo.ln}</Cell>
                                {#if displayPositionRecord == 'ALL'}
                                    <Cell class="center">
                                        <div class="pos {playerATWeekMissedTOP.playerInfo.pos}">
                                            {playerATWeekMissedTOP.playerInfo.pos}
                                        </div>
                                    </Cell>
                                {/if}
                                <Cell class="center">
                                    <img class="teamAvatar" src="https://sleepercdn.com/images/team_logos/nfl/{playerATWeekMissedTOP.team.toLowerCase()}.png" alt="{playerATWeekMissedTOP.team}">
                                </Cell>
                                <Cell class="cellName" on:click={() => gotoManager(playerATWeekMissedTOP.recordManID)}>
                                    {playerATWeekMissedTOP.manager.realname}
                                    {#if !allTime}
                                        <div class="fantasyTeamName">({playerATWeekMissedTOP.manager.name})</div>
                                    {/if}
                                </Cell>
                                {#if allTime}
                                    <Cell class="center">{playerATWeekMissedTOP.year}</Cell>
                                {/if}
                                <Cell class="center">{playerATWeekMissedTOP.week}</Cell>
                                <Cell class="center">{round(playerATWeekMissedTOP.fpts)}</Cell>
                            </Row>
                        {/each}
                    </Body>
                </DataTable>
            {/if}
            {#if playerOverallMissedTOPS && playerOverallMissedTOPS.length}
                <DataTable class="recordTable">
                    <Head>
                        <Row>
                            <Cell class="header" colspan=10>
                                <p>
                                    All-Around Bench Scoring Leaders – {displayPositionRecord == 'ALL' ? 'Players' : displayPositionRecord}<br>
                                    {prefix} – {recordPrefix} 
                                </p>
                            </Cell>                  
                        </Row>
                        <Row>
                            <Cell class="header rank"></Cell>
                            <Cell class="header rank" /> 
                            <Cell class="header">Player</Cell>
                            {#if displayPositionRecord == 'ALL'}
                                <Cell class="header">POS</Cell>
                            {/if}
                            <Cell class="header">NFL Team</Cell>
                            <Cell class="header">Manager</Cell>
                            {#if allTime}
                                <Cell class="header">Seasons</Cell>
                            {/if}
                            <Cell class="header">
                                Benched 
                                <br>
                                / Owned    
                                <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.players.overallMissedHighs, playerOverallMissedTOPS, 'bench')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                BP
                                <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.players.overallMissedHighs, playerOverallMissedTOPS, 'real')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                BPPG
                                <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.players.overallMissedHighs, playerOverallMissedTOPS, 'realPPG')}>filter_list</Icon>
                            </Cell>
                        </Row>
                    </Head>
                    <Body>
                        {#each playerOverallMissedTOPS as player, ix (rand * (ix + 1))}
                            {#if rand == 0}
                                nothing
                            {:else}
                                <Row>
                                    <Cell class="rank">{ix + 1}</Cell>
                                    <Cell class="playerAvatar playerInfo" style="background-image: url('{player.avatar}'); vertical-align: middle; height: 45px; width: 45px; background-position: center; background-repeat: no-repeat; background-size: auto 45px;" />
                                    <Cell class="left">{player.playerInfo.fn} {player.playerInfo.ln}</Cell>
                                    {#if displayPositionRecord == 'ALL'}
                                        <Cell class="center">
                                            <div class="pos {player.playerInfo.pos}">
                                                {player.playerInfo.pos}
                                            </div>
                                        </Cell>
                                    {/if}
                                    <Cell class="center">
                                        <img class="teamAvatar" src="https://sleepercdn.com/images/team_logos/nfl/{player.team.toLowerCase()}.png" alt="{player.team}">
                                    </Cell>
                                    <Cell class="cellName" on:click={() => gotoManager(player.recordManID)}>
                                        {player.manager.realname}
                                        {#if !allTime}
                                            <div class="fantasyTeamName">({player.manager.name})</div>
                                        {/if}
                                    </Cell>
                                    {#if allTime}
                                        <Cell class="center">{player.years.total}</Cell>
                                    {/if}
                                    <Cell class="center">{player.weeks.bench} / {player.weeks.total}</Cell>
                                    <Cell class="center">{round(player.fpts.bench.real)}</Cell>
                                    <Cell class="center">{round(player.fpts.bench.realPPG)}</Cell>
                                </Row>
                            {/if}
                        {/each}
                    </Body>
                </DataTable>
            {/if}
        {/if}
    </div>
</div>

<div class="headerRow">
    <div class="headerLabel" style="justify-content: center">{prefix} Rankings</div>
</div>


<BarChart maxWidth={innerWidth} {graphsObj} {displayRecords} {leagueManagers} {allManagers} bind:displayYear={displayYear} bind:selection={selection} bind:allTime={allTime} bind:curGraph={curGraph} bind:curGraphKey={curGraphKey} bind:curGraphKey2={curGraphKey2} bind:curGraphKey3={curGraphKey3} bind:curGraphKey4={curGraphKey4} bind:curSort={curSort} />

<div class="rankingHolder">
    <div class="rankingInner" style="margin-left: -{100 * curTable}%; width: {7100 + 1100*numPositions}%;">
        <div class="rankingTableWrapper">
            <DataTable class="rankingTable">
                <Head>
                    <Row>
                        <Cell class="header" colspan=6>
                            <p>
                                Win Percentage Rankings<br>
                                {prefix} – {recordPrefix} 
                            </p>
                        </Cell>                      
                    </Row>
                    <Row>
                        <Cell class="header"></Cell>
                        <Cell class="header">Manager</Cell>
                        <Cell class="header">
                            Win %
                            <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.winRecords, winRecords, 'perc', false, null, 'perc')}>filter_list</Icon>
                        </Cell>
                        <Cell class="header">
                            W
                            <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.winRecords, winRecords, 'W', false, null, 'W')}>filter_list</Icon>
                        </Cell>
                            {#if showTies.match}
                                <Cell class="header">
                                    T
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.winRecords, winRecords, 'T', false, null, 'T')}>filter_list</Icon>
                                </Cell>
                            {/if}
                        <Cell class="header">
                            L
                            <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.winRecords, winRecords, 'L', false, null, 'L')}>filter_list</Icon>
                        </Cell>	   
                    </Row>
                </Head>
                <Body>
                    {#each winRecords as winPercentage, ix (rand * (ix + 1))}
                        {#if rand == 0}
                            nothing
                        {:else}
                            <Row>
                                <Cell>{ix + 1}</Cell>
                                <Cell class="cellName" on:click={() => gotoManager(winPercentage.recordManID)}>
                                    {winPercentage.manager.realname}
                                    {#if !allTime}
                                        <div class="fantasyTeamName">({winPercentage.manager.name})</div>
                                    {/if}
                                </Cell>
                                <Cell class="center">{round(winPercentage.outcomes.match.perc)}%</Cell>
                                <Cell class="center">{winPercentage.outcomes.match.W}</Cell>
                                {#if showTies.match}
                                    <Cell class="center">{winPercentage.outcomes.match.T}</Cell>
                                {/if}
                                <Cell class="center">{winPercentage.outcomes.match.L}</Cell>			
                            </Row>
                        {/if}
                    {/each}
                </Body>
            </DataTable>
        </div>

        <div class="rankingTableWrapper">
            {#if seasonEPERecords && seasonEPERecords.length}
                <DataTable class="rankingTable">
                    <Head>
                        <Row>
                            <Cell class="header" colspan=8>
                                <p>
                                    Everyone Plays Everyone Records<br>
                                    {prefix} – {recordPrefix} 
                                </p>
                            </Cell>  
                        </Row>
                        <Row>
                            <Cell class="header"></Cell>
                            <Cell class="header">Manager</Cell>
                            <Cell class="header">
                                EPE Win %
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.epeRecords, seasonEPERecords, 'perc', false, null, 'perc')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                W
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.epeRecords, seasonEPERecords, 'W', false, null, 'W')}>filter_list</Icon>
                            </Cell>
                            {#if showTies.EPE}
                                <Cell class="header">
                                    T
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.epeRecords, seasonEPERecords, 'T', false, null, 'T')}>filter_list</Icon>
                                </Cell>
                            {/if}
                            <Cell class="header">
                                L
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.epeRecords, seasonEPERecords, 'L', false, null, 'L')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Top  
                                <br>
                                Score
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.epeRecords, seasonEPERecords, 'top', false, null, 'top')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Bottom 
                                <br>
                                Score
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.epeRecords, seasonEPERecords, 'bottom', false, null, 'bottom')}>filter_list</Icon>
                            </Cell>	
                        </Row>
                    </Head>
                    <Body>
                        {#each seasonEPERecords as allTimeEPERecord, ix (rand * (ix + 1))}
                            {#if rand == 0}
                                nothing
                            {:else}
                                <Row>
                                    <Cell>{ix + 1}</Cell>
                                    <Cell class="cellName" on:click={() => gotoManager(allTimeEPERecord.recordManID)}>
                                        {allTimeEPERecord.manager.realname}
                                        {#if !allTime}
                                            <div class="fantasyTeamName">({allTimeEPERecord.manager.name})</div>
                                        {/if}
                                    </Cell>			
                                    <Cell class="center">{round(allTimeEPERecord.outcomes.EPE.perc)}%</Cell>
                                    <Cell class="center">{allTimeEPERecord.outcomes.EPE.W}</Cell>
                                    {#if showTies.EPE}
                                        <Cell class="center">{allTimeEPERecord.outcomes.EPE.T}</Cell>
                                    {/if}
                                    <Cell class="center">{allTimeEPERecord.outcomes.EPE.L}</Cell>
                                    <Cell class="center">{allTimeEPERecord.outcomes.EPE.top}</Cell>
                                    <Cell class="center">{allTimeEPERecord.outcomes.EPE.bottom}</Cell>
                                </Row>
                            {/if}
                        {/each}
                    </Body>
                </DataTable>
            {/if}
        </div>

        <div class="rankingTableWrapper">
            <DataTable class="rankingTable">
                <Head>
                    <Row>
                        <Cell class="header" colspan=7>
                            <p>
                                Win Records Against Weekly League Median<br>
                                {prefix} – {recordPrefix} 
                            </p>
                        </Cell>   
                    </Row>
                    <Row>
                        <Cell class="header"></Cell>
                        <Cell class="header">Manager</Cell>
                        <Cell class="header">
                            Diff
                            <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.medianRecords, medianRecords, 'marg', ['margins', 'median'], false, null, 'marg')}>filter_list</Icon>
                            <br>
                            (Diff PG)
                            <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.medianRecords, medianRecords, 'mpg', ['margins', 'median'], false, null, 'mpg')}>filter_list</Icon>
                        </Cell>
                        <Cell class="header">
                            W
                            <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.medianRecords, medianRecords, 'W', ['outcomes', 'median'], false, null, 'W')}>filter_list</Icon>
                        </Cell>
                        {#if showTies.median}
                            <Cell class="header">
                                T
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.medianRecords, medianRecords, 'T', ['outcomes', 'median'], false, null, 'T')}>filter_list</Icon>
                            </Cell>
                        {/if}
                        <Cell class="header">
                            L
                            <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.medianRecords, medianRecords, 'L', ['outcomes', 'median'], false, null, 'L')}>filter_list</Icon>
                        </Cell>
                        <Cell class="header">
                            Median 
                            <br>
                            Win %
                            <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.medianRecords, medianRecords, 'perc', ['outcomes', 'median'], false, null, 'perc')}>filter_list</Icon>
                        </Cell>
                    </Row>
                </Head>
                <Body>
                    {#each medianRecords as medianRecord, ix (rand * (ix + 1))}
                        {#if rand == 0}
                            nothing
                        {:else}
                            <Row>
                                <Cell>{ix + 1}</Cell>
                                <Cell class="cellName" on:click={() => gotoManager(medianRecord.recordManID)}>
                                    {medianRecord.manager.realname}
                                    {#if !allTime}
                                        <div class="fantasyTeamName">({medianRecord.manager.name})</div>
                                    {/if}
                                </Cell>			
                                <Cell>{round(medianRecord.fpts.starters.diff)} <div style="font-size: 0.9em">{round(medianRecord.fpts.starters.diffPG)}</div></Cell>
                                <Cell class="center">{medianRecord.outcomes.median.W}</Cell>
                                {#if showTies.median}
                                    <Cell class="center">{medianRecord.outcomes.median.T}</Cell>
                                {/if}
                                <Cell class="center">{medianRecord.outcomes.median.L}</Cell>
                                <Cell class="center">{round(medianRecord.outcomes.median.perc)}%</Cell>
                            </Row>
                        {/if}
                    {/each}
                </Body>
            </DataTable>
        </div>

        {#if bestBalls && bestBalls.length}
            <div class="rankingTableWrapper">
                <DataTable class="rankingTable">
                    <Head>
                        <Row>
                            <Cell class="header" colspan=12>
                                <p>
                                    Win Records Assuming Optimal Lineups<br>
                                    {prefix} – {recordPrefix} 
                                </p>
                            </Cell>
                        </Row>
                        <Row>
                            <Cell class="header"></Cell>
                            <Cell class="header">Manager</Cell>
                            <Cell class="header">
                                BB Win %
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.bestBalls, bestBalls, 'perc', ['outcomes', 'bball'], false, null, 'domPerc')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                W
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.bestBalls, bestBalls, 'W', ['outcomes', 'bball'], false, null, 'domWins')}>filter_list</Icon>
                            </Cell>
                            {#if showTies.bball}
                                <Cell class="header">
                                    T
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.bestBalls, bestBalls, 'T', ['outcomes', 'bball'], false, null, 'domTies')}>filter_list</Icon>
                                </Cell>
                            {/if}
                            <Cell class="header">
                                L
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.bestBalls, bestBalls, 'L', ['outcomes', 'bball'], false, null, 'domLosses')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                EPE BB 
                                <br>
                                Win %
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.bestBalls, bestBalls, 'perc', ['outcomes', 'bballEPE'], false, null, 'epeDomPerc')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                EPE BB
                                <br>
                                W
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.bestBalls, bestBalls, 'W', ['outcomes', 'bballEPE'], false, null, 'epeDomWins')}>filter_list</Icon>
                            </Cell>
                            {#if showTies.bballEPE}
                                <Cell class="header">
                                    EPE BB
                                    <br>
                                    T
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.bestBalls, bestBalls, 'T', ['outcomes', 'bballEPE'], false, null, 'epeDomTies')}>filter_list</Icon>
                                </Cell>
                            {/if}
                            <Cell class="header">
                                EPE BB
                                <br>
                                L
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.bestBalls, bestBalls, 'L', ['outcomes', 'bballEPE'], false, null, 'epeDomLosses')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Top 
                                <br>
                                Score
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.bestBalls, bestBalls, 'top', ['outcomes', 'bballEPE'], false, null, 'bestballs')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Bottom
                                <br>
                                Score
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.bestBalls, bestBalls, 'bottom', ['outcomes', 'bballEPE'], false, null, 'worstballs')}>filter_list</Icon>
                            </Cell>
                        </Row>
                    </Head>
                    <Body>
                        {#each bestBalls as bestBall, ix (rand * (ix + 1))}
                            {#if rand == 0}
                                nothing
                            {:else}
                                <Row>
                                    <Cell>{ix + 1}</Cell>
                                    <Cell class="cellName" on:click={() => gotoManager(bestBall.recordManID)}>
                                        {bestBall.manager.realname}
                                        {#if !allTime}
                                            <div class="fantasyTeamName">({bestBall.manager.name})</div>
                                        {/if}
                                    </Cell>
                                    <Cell class="header">{round(bestBall.outcomes.bball.perc)}</Cell>
                                    <Cell class="header">{bestBall.outcomes.bball.W}</Cell>
                                    {#if showTies.bball}
                                        <Cell class="header">{bestBall.outcomes.bball.T}</Cell>
                                    {/if}
                                    <Cell class="center">{bestBall.outcomes.bball.L}</Cell>
                                    <Cell class="header">{round(bestBall.outcomes.bballEPE.perc)}</Cell>
                                    <Cell class="header">{bestBall.outcomes.bballEPE.W}</Cell>
                                    {#if showTies.bballEPE}
                                        <Cell class="header">{bestBall.outcomes.bballEPE.T}</Cell>
                                    {/if}
                                    <Cell class="center">{bestBall.outcomes.bballEPE.L}</Cell>
                                    <Cell class="center">{bestBall.outcomes.bballEPE.top}</Cell>
                                    <Cell class="center">{bestBall.outcomes.bballEPE.bottom}</Cell>
                                </Row>
                            {/if}
                        {/each}
                    </Body>
                </DataTable>
            </div>
        {/if}

        <div class="rankingTableWrapper">
            {#if blowoutBests && blowoutBests.length}
                <DataTable class="recordTable" style="width: 900px;">
                    <Head>
                        <Row>
                            <Cell class="header" colspan=9>
                                <p>
                                    Biggest Blowout Victories<br>
                                    {prefix} – {recordPrefix} 
                                </p>
                            </Cell>                  
                        </Row>
                        <Row>
                            <Cell class="header rank"></Cell>
                            <Cell class="header">Winner</Cell>
                            <Cell class="header">
                                PF
                                <br>
                                (Proj)
                            </Cell>
                            <Cell class="header rank"></Cell>
                            <Cell class="header">Loser</Cell>
                            <Cell class="header">
                                PF
                                <br>
                                (Proj)
                            </Cell>
                            {#if allTime}
                                <Cell class="header">Year</Cell>
                            {/if}
                            <Cell class="header">Week</Cell>
                            <Cell class="header">Margin</Cell>
                        </Row>
                    </Head>
                    <Body>
                        {#each blowoutBests as blowout, ix}
                            <Row>
                                <Cell class="rank">{ix + 1}</Cell>
                                <Cell class="cellName" style="background-color: #229bd924;" on:click={() => gotoManager(blowout.recordManID)}>
                                    {blowout.manager.realname}
                                    {#if !allTime}
                                        <div class="fantasyTeamName">({blowout.manager.name})</div>
                                    {/if}
                                </Cell>
                                <Cell class="center" style="background-color: #0182c326;">{round(blowout.fpts.starters.real)} <div style="font-size: 0.9em">({round(blowout.fpts.starters.proj)})</div></Cell>
                                <Cell class="center">vs</Cell>
                                <Cell class="cellName" style="background-color: #7a7a7a33;" on:click={() => gotoManager(blowout.oppRecordManID)}>
                                    {blowout.oppManager.realname}
                                    {#if !allTime}
                                        <div class="fantasyTeamName">({blowout.oppManager.name})</div>
                                    {/if}
                                </Cell>
                                <Cell class="center" style="background-color: #6a6a6a33;">{round(blowout.fpts.opp.real)} <div style="font-size: 0.9em">({round(blowout.fpts.opp.proj)})</div></Cell>
                                {#if allTime}
                                    <Cell class="center">{blowout.year}</Cell>
                                {/if}
                                <Cell class="center">{blowout.week}</Cell>
                                <Cell class="center">{round(blowout.matchDifferential)}</Cell>
                            </Row>
                        {/each}
                    </Body>
                </DataTable>
            {/if}
        </div>

        <div class="rankingTableWrapper">
            {#if blowoutWorsts && blowoutWorsts.length}
                <DataTable class="recordTable" style="width: 900px;">
                    <Head>
                        <Row>
                            <Cell class="header" colspan=9>
                                <p>
                                    Worst Shutout Defeats<br>
                                    {prefix} – {recordPrefix} 
                                </p>
                            </Cell>                  
                        </Row>
                        <Row>
                            <Cell class="header rank"></Cell>
                            <Cell class="header">Loser</Cell>
                            <Cell class="header">
                                PF
                                <br>
                                (Proj)
                            </Cell>
                            <Cell class="header rank"></Cell>
                            <Cell class="header">Winner</Cell>
                            <Cell class="header">
                                PA
                                <br>
                                (Proj)
                            </Cell>
                            {#if allTime}
                                <Cell class="header">Year</Cell>
                            {/if}
                            <Cell class="header">Week</Cell>
                            <Cell class="header">Margin</Cell>
                        </Row>
                    </Head>
                    <Body>
                        {#each blowoutWorsts as shutout, ix}
                            <Row>
                                <Cell class="rank">{ix + 1}</Cell>
                                <Cell class="cellName" style="background-color: #7a7a7a33;" on:click={() => gotoManager(shutout.recordManID)}>
                                    {shutout.manager.realname}
                                    {#if !allTime}
                                        <div class="fantasyTeamName">({shutout.manager.name})</div>
                                    {/if}
                                </Cell>
                                <Cell class="center" style="background-color: #6a6a6a33;">{round(shutout.fpts.starters.real)} <div style="font-size: 0.9em">({round(shutout.fpts.starters.proj)})</div></Cell>
                                <Cell class="center">vs</Cell>
                                <Cell class="cellName" style="background-color: #229bd924;" on:click={() => gotoManager(shutout.oppRecordManID)}>
                                    {shutout.oppManager.realname}
                                    {#if !allTime}
                                        <div class="fantasyTeamName">({shutout.oppManager.name})</div>
                                    {/if}
                                </Cell>
                                <Cell class="center" style="background-color: #0182c326;">{round(shutout.fpts.opp.real)} <div style="font-size: 0.9em">({round(shutout.fpts.opp.proj)})</div></Cell>
                                {#if allTime}
                                    <Cell class="center">{shutout.year}</Cell>
                                {/if}
                                <Cell class="center">{shutout.week}</Cell>
                                <Cell class="center">{round(shutout.matchDifferential)}</Cell>
                            </Row>
                        {/each}
                    </Body>
                </DataTable>
            {/if}
        </div>

        <div class="rankingTableWrapper">
            {#if narrowBests && narrowBests.length}
                <DataTable class="recordTable" style="width: 900px;">
                    <Head>
                        <Row>
                            <Cell class="header" colspan=9>
                                <p>
                                    Narrowest Victories<br>
                                    {prefix} – {recordPrefix} 
                                </p>
                            </Cell>                  
                        </Row>
                        <Row>
                            <Cell class="header rank"></Cell>
                            <Cell class="header">Winner</Cell>
                            <Cell class="header">
                                PF
                                <br>
                                (Proj)
                            </Cell>
                            <Cell class="header rank"></Cell>
                            <Cell class="header">Loser</Cell>
                            <Cell class="header">
                                PF
                                <br>
                                (Proj)
                            </Cell>
                            {#if allTime}
                                <Cell class="header">Year</Cell>
                            {/if}
                            <Cell class="header">Week</Cell>
                            <Cell class="header">Margin</Cell>
                        </Row>
                    </Head>
                    <Body>
                        {#each narrowBests as squeaker, ix}
                            <Row>
                                <Cell class="rank">{ix + 1}</Cell>
                                <Cell class="cellName" style="background-color: #229bd924;" on:click={() => gotoManager(squeaker.recordManID)}>
                                    {squeaker.manager.realname}
                                    {#if !allTime}
                                        <div class="fantasyTeamName">({squeaker.manager.name})</div>
                                    {/if}
                                </Cell>
                                <Cell class="center" style="background-color: #0182c326;">{round(squeaker.fpts.starters.real)} <div style="font-size: 0.9em">({round(squeaker.fpts.starters.proj)})</div></Cell>
                                <Cell class="center">vs</Cell>
                                <Cell class="cellName" style="background-color: #7a7a7a33;" on:click={() => gotoManager(squeaker.oppRecordManID)}>
                                    {squeaker.oppManager.realname}
                                    {#if !allTime}
                                        <div class="fantasyTeamName">({squeaker.oppManager.name})</div>
                                    {/if}
                                </Cell>
                                <Cell class="center" style="background-color: #6a6a6a33;">{round(squeaker.fpts.opp.real)} <div style="font-size: 0.9em">({round(squeaker.fpts.opp.proj)})</div></Cell>
                                {#if allTime}
                                    <Cell class="center">{squeaker.year}</Cell>
                                {/if}
                                <Cell class="center">{squeaker.week}</Cell>
                                <Cell class="center">{round(squeaker.matchDifferential)}</Cell>
                            </Row>
                        {/each}
                    </Body>
                </DataTable>
            {/if}
        </div>

        <div class="rankingTableWrapper">
            {#if narrowWorsts && narrowWorsts.length}
                <DataTable class="recordTable" style="width: 900px;">
                    <Head>
                        <Row>
                            <Cell class="header" colspan=9>
                                <p>
                                    Narrowest Defeats<br>
                                    {prefix} – {recordPrefix} 
                                </p>
                            </Cell>                  
                        </Row>
                        <Row>
                            <Cell class="header rank"></Cell>
                            <Cell class="header">Loser</Cell>
                            <Cell class="header">
                                PF
                                <br>
                                (Proj)
                            </Cell>
                            <Cell class="header rank"></Cell>
                            <Cell class="header">Winner</Cell>
                            <Cell class="header">
                                PA
                                <br>
                                (Proj)
                            </Cell>
                            {#if allTime}
                                <Cell class="header">Year</Cell>
                            {/if}
                            <Cell class="header">Week</Cell>
                            <Cell class="header">Margin</Cell>
                        </Row>
                    </Head>
                    <Body>
                        {#each narrowWorsts as heartbreak, ix}
                            <Row>
                                <Cell class="rank">{ix + 1}</Cell>
                                <Cell class="cellName" style="background-color: #7a7a7a33;" on:click={() => gotoManager(heartbreak.recordManID)}>
                                    {heartbreak.manager.realname}
                                    {#if !allTime}
                                        <div class="fantasyTeamName">({heartbreak.manager.name})</div>
                                    {/if}
                                </Cell>
                                <Cell class="center" style="background-color: #6a6a6a33;">{round(heartbreak.fpts.starters.real)} <div style="font-size: 0.9em">({round(heartbreak.fpts.starters.proj)})</div></Cell>
                                <Cell class="center">vs</Cell>
                                <Cell class="cellName" style="background-color: #229bd924;" on:click={() => gotoManager(heartbreak.oppRecordManID)}>
                                    {heartbreak.oppManager.realname}
                                    {#if !allTime}
                                        <div class="fantasyTeamName">({heartbreak.oppManager.name})</div>
                                    {/if}
                                </Cell>
                                <Cell class="center" style="background-color: #0182c326;">{round(heartbreak.fpts.opp.real)} <div style="font-size: 0.9em">({round(heartbreak.fpts.opp.proj)})</div></Cell>
                                {#if allTime}
                                    <Cell class="center">{heartbreak.year}</Cell>
                                {/if}
                                <Cell class="center">{heartbreak.week}</Cell>
                                <Cell class="center">{round(heartbreak.matchDifferential)}</Cell>
                            </Row>
                        {/each}
                    </Body>
                </DataTable>
            {/if}
        </div>

        <div class="rankingTableWrapper">
            <DataTable class="rankingTable">
                <Head>
                    <Row>
                        <Cell class="header" colspan=5>
                            <p>
                                Points Per Game Rankings<br>
                                {prefix} – {recordPrefix} 
                            </p>
                        </Cell>   
                    </Row>
                    <Row>
                        <Cell class="header"></Cell>
                        <Cell class="header">Manager</Cell>
                        <Cell class="header">
                            PF
                            <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.fptsHistories, fptsHistories, 'real', ['fpts', 'starters'], false, null, 'fpts')}>filter_list</Icon>
                        </Cell>
                        <Cell class="header">
                            PA
                            <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.fptsHistories, fptsHistories, 'real', ['fpts', 'opp'], false, null, 'fptsAgainst')}>filter_list</Icon>
                        </Cell>
			            <Cell class="header">
                            PPG
                            <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.fptsHistories, fptsHistories, 'realPPG', ['fpts', 'starters'], false, null, 'fptspg')}>filter_list</Icon>
                        </Cell>
                    </Row>
                </Head>
                <Body>
                    {#each fptsHistories as fptsHistory, ix (rand * (ix + 1))}
                        {#if rand == 0}
                            nothing
                        {:else}
                            <Row>
                                <Cell>{ix + 1}</Cell>
                                <Cell class="cellName" on:click={() => gotoManager(fptsHistory.recordManID)}>
                                    {fptsHistory.manager.realname}
                                    {#if !allTime}
                                        <div class="fantasyTeamName">({fptsHistory.manager.name})</div>
                                    {/if}
                                </Cell>
                                <Cell class="center">{round(fptsHistory.fpts.starters.real)}</Cell>
                                <Cell class="center">{round(fptsHistory.fpts.opp.real)}</Cell>
                                <Cell class="center">{round(fptsHistory.fpts.starters.realPPG)}</Cell>
                            </Row>
                        {/if}
                    {/each}
                </Body>
            </DataTable>
        </div>

        {#if lineupIQs[0]?.iq}
            <div class="rankingTableWrapper">
                <DataTable class="rankingTable">
                    <Head>
                        <Row>
                            <Cell class="header" colspan=16>
                                {prefix} Lineup IQ Rankings
                                <div class="subTitle">
                                    The percentage of potential points each manager has captured
                                </div>
                            </Cell>
                        </Row>
                        <Row>
                            <Cell class="header"></Cell>
                            <Cell class="header">Manager</Cell>
                            <Cell class="header">
                                IQ 
                                <br>
                                W
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.lineupIqs, lineupIQs, 'W', ['outcomes', 'iq'], false, null, 'iqWins')}>filter_list</Icon>
                            </Cell>
                            {#if showTies.iq}
                                <Cell class="header">
                                    IQ 
                                    <br>
                                    T
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.lineupIqs, lineupIQs, 'T', ['outcomes', 'iq'], false, null, 'iqTies')}>filter_list</Icon>
                                </Cell>
                            {/if}
                            <Cell class="header">
                                IQ
                                <br>
                                L
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.lineupIqs, lineupIQs, 'L', ['outcomes', 'iq'], false, null, 'iqLosses')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                IQ 
                                <br>
                                Win %
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.lineupIqs, lineupIQs, 'perc', ['outcomes', 'iq'], false, null, 'iqPerc')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                IQ EPE
                                <br>
                                W
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.lineupIqs, lineupIQs, 'W', ['outcomes', 'iqEPE'], false, null, 'iqEpeW')}>filter_list</Icon>
                            </Cell>
                            {#if showTies.iqEPE}
                                <Cell class="header">
                                    IQ EPE
                                    <br>
                                    T
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.lineupIqs, lineupIQs, 'T', ['outcomes', 'iqEPE'], false, null, 'iqEpeT')}>filter_list</Icon>
                                </Cell>
                            {/if}
                            <Cell class="header">
                                IQ EPE 
                                <br>
                                L
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.lineupIqs, lineupIQs, 'L', ['outcomes', 'iqEPE'], false, null, 'iqEpeL')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                IQ EPE
                                <br>
                                Win %
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.lineupIqs, lineupIQs, 'perc', ['outcomes', 'iqEPE'], false, null, 'iqEpePerc')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Perfect
                                <br>
                                Lineups
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.lineupIqs, lineupIQs, 'perfects', false, null, 'perfects')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Best
                                <br>
                                IQs
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.lineupIqs, lineupIQs, 'top', ['outcomes', 'iq'], false, null, 'topIqs')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Worst
                                <br>
                                IQs
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.lineupIqs, lineupIQs, 'bottom', ['outcomes', 'iq'], false, null, 'bottomIqs')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Possible 
                                <br>
                                PF
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.lineupIqs, lineupIQs, 'poss', ['fpts', 'starters'], false, null, 'poss')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Actual
                                <br>
                                PF
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.lineupIqs, lineupIQs, 'real', ['fpts', 'starters'], false, null, 'fpts')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                IQ
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.lineupIqs, lineupIQs, 'iq', false, null, 'iq')}>filter_list</Icon>
                            </Cell>
                        </Row>
                    </Head>
                    <Body>
                        {#each lineupIQs as lineupIQ, ix (rand * (ix + 1))}
                            {#if rand == 0}
                                nothing
                            {:else}
                                <Row>
                                    <Cell>{ix + 1}</Cell>
                                    <Cell class="cellName" on:click={() => gotoManager(lineupIQ.recordManID)}>
                                        {lineupIQ.manager.realname}
                                        {#if !allTime}
                                            <div class="fantasyTeamName">({lineupIQ.manager.name})</div>
                                        {/if}
                                    </Cell>
                                    <Cell class="header">{lineupIQ.outcomes.iq.W}</Cell>
                                    {#if showTies.iq}
                                        <Cell class="header">{lineupIQ.outcomes.iq.T}</Cell>
                                    {/if}
                                    <Cell class="header">{lineupIQ.outcomes.iq.L}</Cell>
                                    <Cell class="center">{round(lineupIQ.outcomes.iq.perc)}</Cell>
                                    <Cell class="header">{lineupIQ.outcomes.iqEPE.W}</Cell>
                                    {#if showTies.iqEPE}
                                        <Cell class="header">{lineupIQ.outcomes.iqEPE.T}</Cell>
                                    {/if}
                                    <Cell class="header">{lineupIQ.outcomes.iqEPE.L}</Cell>
                                    <Cell class="center">{round(lineupIQ.outcomes.iqEPE.perc)}</Cell>
                                    <Cell class="header">{lineupIQ.perfects}</Cell>
                                    <Cell class="header">{lineupIQ.outcomes.iqEPE.top}</Cell>
                                    <Cell class="header">{lineupIQ.outcomes.iqEPE.bottom}</Cell>
                                    <Cell class="center">{round(lineupIQ.fpts.starters.poss)}</Cell>
                                    <Cell class="center">{round(lineupIQ.fpts.starters.real)}</Cell>
                                    <Cell class="center">{round(lineupIQ.iq)}%</Cell>
                                </Row>
                            {/if}
                        {/each}
                    </Body>
                </DataTable>
            </div>
        {/if}

        {#if potentialPoints && potentialPoints.length}
            <div class="rankingTableWrapper">
                <DataTable class="rankingTable">
                    <Head>
                        <Row>
                            <Cell class="header" colspan=8>
                                <p>
                                    Potential vs Total Points<br>
                                    {prefix} – {recordPrefix} 
                                </p>
                            </Cell>
                        </Row>
                        <Row>
                            <Cell class="header"></Cell>
                            <Cell class="header">Manager</Cell>
                            <Cell class="header">
                                PA
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.potentialPoints, potentialPoints, 'real', ['fpts', 'opp'], false, null, 'fptsAgainst')}>filter_list</Icon>
                                <br>
                                (PPG)
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.potentialPoints, potentialPoints, 'realPPG', ['fpts', 'opp'], false, null, 'fptsAgainstPg')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Poss. PA
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.potentialPoints, potentialPoints, 'poss', ['fpts', 'opp'], false, null, 'fptsAgPoss')}>filter_list</Icon>
                                <br>
                                (PPG)
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.potentialPoints, potentialPoints, 'possPPG', ['fpts', 'opp'], false, null, 'fptsAgPossPg')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                PF
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.potentialPoints, potentialPoints, 'real', ['fpts', 'starters'], false, null, 'fpts')}>filter_list</Icon>
                                <br>
                                (PPG)
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.potentialPoints, potentialPoints, 'realPPG', ['fpts', 'starters'], false, null, 'fptspg')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Bench
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.potentialPoints, potentialPoints, 'real', ['fpts', 'bench'], false, null, 'benchPoints')}>filter_list</Icon>
                                <br>
                                (PPG)
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.potentialPoints, potentialPoints, 'realPPG', ['fpts', 'bench'], false, null, 'benchPPG')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                S+B PF
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.potentialPoints, potentialPoints, 'real', ['fpts', 'total'], false, null, 'totalFpts')}>filter_list</Icon>
                                <br>
                                (PPG)
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.potentialPoints, potentialPoints, 'realPPG', ['fpts', 'total'], false, null, 'totalPPG')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Poss. PF
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.potentialPoints, potentialPoints, 'poss', ['fpts', 'starters'], false, null, 'fptsPoss')}>filter_list</Icon>
                                <br>
                                (PPG)
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.potentialPoints, potentialPoints, 'possPPG', ['fpts', 'starters'], false, null, 'fptsPossPg')}>filter_list</Icon>
                            </Cell>
                        </Row>
                    </Head>
                    <Body>
                        {#each potentialPoints as potential, ix (rand * (ix + 1))}
                            {#if rand == 0}
                                nothing
                            {:else}
                                <Row>
                                    <Cell>{ix + 1}</Cell>
                                    <Cell class="cellName" on:click={() => gotoManager(potential.recordManID)}>
                                        {potential.manager.realname}
                                        {#if !allTime}
                                            <div class="fantasyTeamName">({potential.manager.name})</div>
                                        {/if}
                                    </Cell>
                                    <Cell class="header">{round(potential.fpts.opp.real)} <div style="font-size: 0.9em">({round(potential.fpts.opp.realPPG)})</div></Cell>
                                    <Cell class="header">{round(potential.fpts.opp.poss)} <div style="font-size: 0.9em">({round(potential.fpts.opp.possPPG)})</div></Cell>
                                    <Cell class="header">{round(potential.fpts.starters.real)} <div style="font-size: 0.9em">({round(potential.fpts.starters.realPPG)})</div></Cell>
                                    <Cell class="header">{round(potential.fpts.bench.real)} <div style="font-size: 0.9em">({round(potential.fpts.bench.realPPG)})</div></Cell>
                                    <Cell class="header">{round(potential.fpts.total.real)} <div style="font-size: 0.9em">({round(potential.fpts.total.realPPG)})</div></Cell>
                                    <Cell class="center">{round(potential.fpts.starters.poss)} <div style="font-size: 0.9em">({round(potential.fpts.starters.possPPG)})</div></Cell>
                                </Row>
                            {/if}
                        {/each}
                    </Body>
                </DataTable>
            </div>
        {/if}

        {#if projRecords && projRecords.length}
            <div class="rankingTableWrapper">
                <DataTable class="rankingTable">
                    <Head>
                        <Row>
                            <Cell class="header" colspan=8>
                                <p>
                                    Projected vs Total Points<br>
                                    {prefix} – {recordPrefix} 
                                </p>
                            </Cell>
                        </Row>
                        <Row>
                            <Cell class="header"></Cell>
                            <Cell class="header">Manager</Cell>
                            <Cell class="header">
                                Beat Proj.
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.projRecords, projRecords, 'beatProj', [], false, null, true)}>filter_list</Icon>
                                <br>
                                (Rate)
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.projRecords, projRecords, 'beatProjPerc', [], false, null, true)}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Beat Optimal
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.projRecords, projRecords, 'beatOptProj', [], false, null, true)}>filter_list</Icon>
                                <br>
                                (Rate)
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.projRecords, projRecords, 'beatOptProjPerc', [], false, null, true)}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                PA
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.projRecords, projRecords, 'real', ['fpts', 'opp'], false, null, 'fptsAgainst')}>filter_list</Icon>
                                <br>
                                (PPG)
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.projRecords, projRecords, 'realPPG', ['fpts', 'opp'], false, null, 'fptsAgainstPg')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Proj. PA
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.projRecords, projRecords, 'proj', ['fpts', 'opp'], false, null, 'projFptsAgainst')}>filter_list</Icon>
                                <br>
                                (PPG)
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.projRecords, projRecords, 'projPPG', ['fpts', 'opp'], false, null, 'projFptsAgainstPg')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                PF
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.projRecords, projRecords, 'real', ['fpts', 'starters'], false, null, 'fpts')}>filter_list</Icon>
                                <br>
                                (PPG)
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.projRecords, projRecords, 'realPPG', ['fpts', 'starters'], false, null, 'fptspg')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Proj PF
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.projRecords, projRecords, 'proj', ['fpts', 'starters'], false, null, 'projFpts')}>filter_list</Icon>
                                <br>
                                (PPG)
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.projRecords, projRecords, 'projPPG', ['fpts', 'starters'], false, null, 'projPPG')}>filter_list</Icon>
                            </Cell>
                        </Row>
                    </Head>
                    <Body>
                        {#each projRecords as projection, ix (rand * (ix + 1))}
                            {#if rand == 0}
                                nothing
                            {:else}
                                <Row>
                                    <Cell>{ix + 1}</Cell>
                                    <Cell class="cellName" on:click={() => gotoManager(projection.recordManID)}>
                                        {projection.manager.realname}
                                        {#if !allTime}
                                            <div class="fantasyTeamName">({projection.manager.name})</div>
                                        {/if}
                                    </Cell>
                                    <Cell class="header">{projection.beatProj} <div style="font-size: 0.9em">({round(projection.beatProjPerc)}%)</div></Cell>
                                    <Cell class="header">{projection.beatOptProj} <div style="font-size: 0.9em">({round(projection.beatOptProjPerc)}%)</div></Cell>
                                    <Cell class="header">{round(projection.fpts.opp.real)} <div style="font-size: 0.9em">({round(projection.fpts.opp.realPPG)})</div></Cell>
                                    <Cell class="header">{round(projection.fpts.opp.proj)} <div style="font-size: 0.9em">({round(projection.fpts.opp.projPPG)})</div></Cell>
                                    <Cell class="header">{round(projection.fpts.starters.real)} <div style="font-size: 0.9em">({round(projection.fpts.starters.realPPG)})</div></Cell>
                                    <Cell class="center">{round(projection.fpts.starters.proj)} <div style="font-size: 0.9em">({round(projection.fpts.starters.projPPG)})</div></Cell>
                                </Row>
                            {/if}
                        {/each}
                    </Body>
                </DataTable>
            </div>
        {/if}

        <div class="rankingTableWrapper">
            {#if seasonBests && seasonBests.length}
                <DataTable class="rankingTable">
                    <Head>
                        <Row>
                            <Cell class="header" colspan=5>
                                <p>
                                    Personal Best Season-Long Scores<br>
                                    {prefix} – {recordPrefix} 
                                </p>
                            </Cell>  
                        </Row>
                        <Row>
                            <Cell class="header"></Cell>
                            <Cell class="header">Manager</Cell>
                                {#if allTime}
                                    <Cell class="header">Year</Cell>
                                {/if}
                            <Cell class="header">
                                PF
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.periodHighs, seasonBests, 'real', false, null, 'fpts')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                PPG
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.periodHighs, seasonBests, 'realPPG', false, null, 'fptspg')}>filter_list</Icon>
                            </Cell>
                        </Row>
                    </Head>
                    <Body>
                        {#each seasonBests as allTimeSeasonBest, ix (rand * (ix + 1))}
                            {#if rand == 0}
                                nothing
                            {:else}
                                <Row>
                                    <Cell>{ix + 1}</Cell>
                                    <Cell class="cellName" on:click={() => gotoManager(allTimeSeasonBest.recordManID)}>
                                        {allTimeSeasonBest.manager.realname}
                                        {#if !allTime}
                                            <div class="fantasyTeamName">({allTimeSeasonBest.manager.name})</div>
                                        {/if}
                                    </Cell>
                                        {#if allTime}				
                                            <Cell class="center">{allTimeSeasonBest.year}</Cell>
                                        {/if}
                                    <Cell class="center">{round(allTimeSeasonBest.fpts.starters.real)}</Cell>
                                    <Cell class="center">{round(allTimeSeasonBest.fpts.starters.realPPG)}</Cell>
                                </Row>
                            {/if}
                        {/each}
                    </Body>
                </DataTable>
            {/if}
        </div>

        <div class="rankingTableWrapper">
            {#if seasonWorsts && seasonWorsts.length}
                <DataTable class="rankingTable">
                    <Head>
                        <Row>
                            <Cell class="header" colspan=5>
                                <p>
                                    Personal Worst Season-Long Scores<br>
                                    {prefix} – {recordPrefix} 
                                </p>
                            </Cell>  
                        </Row>
                        <Row>
                            <Cell class="header"></Cell>
                            <Cell class="header">Manager</Cell>
                            <Cell class="header">Year</Cell>
                            <Cell class="header">
                                PF
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.periodLows, seasonWorsts, 'real', false, null, 'fpts')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                PPG
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.managerBests.periodLows, seasonWorsts, 'realPPG', false, null, 'fptspg')}>filter_list</Icon>
                            </Cell>
                        </Row>
                    </Head>
                    <Body>
                        {#each seasonWorsts as allTimeSeasonWorst, ix (rand * (ix + 1))}
                            {#if rand == 0}
                                nothing
                            {:else}
                                <Row>
                                    <Cell>{ix + 1}</Cell>
                                    <Cell class="cellName" on:click={() => gotoManager(allTimeSeasonWorst.recordManID)}>
                                        {allTimeSeasonWorst.manager.realname}
                                        {#if !allTime}
                                            <div class="fantasyTeamName">({allTimeSeasonWorst.manager.name})</div>
                                        {/if}
                                    </Cell>
                                    <Cell class="center">{allTimeSeasonWorst.year}</Cell>
                                    <Cell class="center">{round(allTimeSeasonWorst.fpts.starters.real)}</Cell>
                                    <Cell class="center">{round(allTimeSeasonWorst.fpts.starters.realPPG)}</Cell>
                                </Row>
                            {/if}
                        {/each}
                    </Body>
                </DataTable>
            {/if}
        </div>

        <div class="rankingTableWrapper">
            {#if weekBests && weekBests.length}
                <DataTable class="rankingTable">
                    <Head>
                        <Row>
                            <Cell class="header" colspan=5>
                                <p>
                                    Personal Best Week Scores<br>
                                    {prefix} – {recordPrefix} 
                                </p>
                            </Cell>  
                        </Row>
                        <Row>
                            <Cell class="header"></Cell>
                            <Cell class="header">Manager</Cell>
                                {#if allTime}
                                    <Cell class="header">Year</Cell>
                                {/if}
                            <Cell class="header">Week</Cell>
                            <Cell class="header">PF</Cell>
                        </Row>
                    </Head>
                    <Body>
                        {#each weekBests as allTimeWeekBest, ix}
                            <Row>
                                <Cell>{ix + 1}</Cell>
                                <Cell class="cellName" on:click={() => gotoManager(allTimeWeekBest.recordManID)}>
                                    {allTimeWeekBest.manager.realname}
                                    {#if !allTime}
                                        <div class="fantasyTeamName">({allTimeWeekBest.manager.name})</div>
                                    {/if}
                                </Cell>
                                {#if allTime}				
                                    <Cell class="center">{allTimeWeekBest.year}</Cell>
                                {/if}
                                <Cell class="center">{allTimeWeekBest.week}</Cell>
                                <Cell class="center">{round(allTimeWeekBest.fpts.starters.real)}</Cell>
                            </Row>
                        {/each}
                    </Body>
                </DataTable>
            {/if}
        </div>
	    
        <div class="rankingTableWrapper">
            {#if weekWorsts && weekWorsts.length}
                <DataTable class="rankingTable">
                    <Head>
                        <Row>
                            <Cell class="header" colspan=5>
                                <p>
                                    Personal Worst Week Scores<br>
                                    {prefix} – {recordPrefix} 
                                </p>
                            </Cell>  
                        </Row>
                        <Row>
                            <Cell class="header"></Cell>
                            <Cell class="header">Manager</Cell>
                            {#if allTime}
                                <Cell class="header">Year</Cell>
                            {/if}
                            <Cell class="header">Week</Cell>
                            <Cell class="header">PF</Cell>
                        </Row>
                    </Head>
                    <Body>
                        {#each weekWorsts as allTimeWeekWorst, ix}
                            <Row>
                                <Cell>{ix + 1}</Cell>
                                <Cell class="cellName" on:click={() => gotoManager(allTimeWeekWorst.recordManID)}>
                                    {allTimeWeekWorst.manager.realname}
                                    {#if !allTime}
                                        <div class="fantasyTeamName">({allTimeWeekWorst.manager.name})</div>
                                    {/if}
                                </Cell>
                                    {#if allTime}				
                                        <Cell class="center">{allTimeWeekWorst.year}</Cell>
                                    {/if}
                                <Cell class="center">{allTimeWeekWorst.week}</Cell>
                                <Cell class="center">{round(allTimeWeekWorst.fpts.starters.real)}</Cell>
                            </Row>
                        {/each}
                    </Body>
                </DataTable>
            {/if}
        </div>

        <div class="rankingTableWrapper">
            {#if playerOverallBests && playerOverallBests.length}
                <DataTable class="rankingTable">
                    <Head>
                        <Row>
                            <Cell class="header" colspan=13>
                                <p>
                                    {#if allTime}
                                        Most Cumulative Points – Players<br>
                                    {:else}
                                        Most Starting & Bench Points - Players<br>
                                    {/if}
                                    {prefix} – {recordPrefix} 
                                </p>
                            </Cell>  
                        </Row>
                        <Row>
                            <Cell class="header rank"></Cell>
                            <Cell class="header rank" />
                            <Cell class="header">Player</Cell>
                            <Cell class="header">POS</Cell>
                            <Cell class="header">NFL Team</Cell>
                            <Cell class="header">Manager</Cell>
                            {#if allTime}
                                <Cell class="header">Years</Cell>
                            {/if}
                            <Cell class="header">
                                Led Team
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.managerBests.overallHighs, playerOverallBests, 'topStarters', [], false, null, 'topStarters')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Team Bust
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.managerBests.overallHighs, playerOverallBests, 'bottomStarters', [], false, null, 'bottomStarters')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Avg Rank
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.managerBests.overallHighs, playerOverallBests, 'starterRankAVG', [], true, null, 'starterRankAVG')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Starts
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.managerBests.overallHighs, playerOverallBests, 'starters', ['weeks'], false, null, 'weeksStarted')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                PF
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.managerBests.overallHighs, playerOverallBests, 'real', ['fpts', 'starters'], false, ['fpts', 'total'], 'fpts')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                PPG
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.managerBests.overallHighs, playerOverallBests, 'realPPG', ['fpts', 'starters'], false, ['fpts', 'total'], 'fptspg')}>filter_list</Icon>
                            </Cell>
                        </Row>
                    </Head>
                    <Body>
                        {#each playerOverallBests as playerOverallBest, ix (rand * (ix + 1))}
                            {#if rand == 0}
                                nothing
                            {:else}
                                <Row>
                                    <Cell class="rank">{ix + 1}</Cell>
                                    <Cell class="playerAvatar playerInfo" style="{playerOverallBest.avatar}; vertical-align: middle; height: 45px; width: 45px; background-position: center; background-repeat: no-repeat; background-size: auto 45px;" />
                                    <Cell class="left">{playerOverallBest.playerInfo.fn} {playerOverallBest.playerInfo.ln}</Cell>
                                    <Cell class="center">
                                        <div class="pos {playerOverallBest.playerInfo.pos}">
                                            {playerOverallBest.playerInfo.pos}
                                        </div>
                                    </Cell>
                                    <Cell class="center">
                                        <img class="teamAvatar" src="https://sleepercdn.com/images/team_logos/nfl/{playerOverallBest.team.toLowerCase()}.png" alt="{playerOverallBest.team}">
                                    </Cell>
                                    <Cell class="cellName" on:click={() => gotoManager(playerOverallBest.recordManID)}>
                                        {playerOverallBest.manager.realname}
                                        {#if !allTime}
                                            <div class="fantasyTeamName">({playerOverallBest.manager.name})</div>
                                        {/if}
                                    </Cell>
                                    {#if allTime}
                                        <Cell class="center">{playerOverallBest.years.total}</Cell>
                                    {/if}
                                    <Cell class="center">{playerOverallBest.topStarters}</Cell>
                                    <Cell class="center">{playerOverallBest.bottomStarters}</Cell>
                                    <Cell class="center">{round(playerOverallBest.starterRankAVG)}</Cell>
                                    <Cell class="center">{playerOverallBest.weeks.starters} / {playerOverallBest.weeks.total}</Cell>
                                    <Cell class="center">{allTime ? round(playerOverallBest.fpts.starters.real) : round(playerOverallBest.fpts.total.real)}</Cell>
                                    <Cell class="center">{allTime ? round(playerOverallBest.fpts.starters.realPPG) : round(playerOverallBest.fpts.total.realPPG)}</Cell>
                                </Row>
                            {/if}
                        {/each}
                    </Body>
                </DataTable>
            {/if}
        </div>

        <div class="rankingTableWrapper">
            {#if gamesBests && gamesBests.length}
                <DataTable class="recordTable">
                    <Head>
                        <Row>
                            <Cell class="header" colspan=13>
                                <p>
                                    Most Weeks Started – Players<br>
                                    {prefix} – {recordPrefix} 
                                </p>
                            </Cell>                  
                        </Row>
                        <Row>
                            <Cell class="header rank"></Cell>
                            <Cell class="header rank" />
                            <Cell class="header">Player</Cell>
                            <Cell class="header">POS</Cell>
                            <Cell class="header">NFL Team</Cell>
                            <Cell class="header">Manager</Cell>
                            {#if allTime}
                                <Cell class="header">Seasons</Cell>
                            {/if}
                            <Cell class="header">
                                Led Team
                                <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.players.gamesHighs, gamesBests, 'topStarters', [], false, null, 'topStarters')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Team Bust
                                <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.players.gamesHighs, gamesBests, 'bottomStarters', [], false, null, 'bottomStarters')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Avg Rank
                                <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.players.gamesHighs, gamesBests, 'starterRankAVG', [], true, null, 'starterRankAVG')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                PF
                                <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.players.gamesHighs, gamesBests, 'real', ['fpts', 'starters'], false, null, 'fpts')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                PPG
                                <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.players.gamesHighs, gamesBests, 'realPPG', ['fpts', 'starters'], false, null, 'fptspg')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Starts
                                <Icon class="material-icons changeSort" on:click={() => changeSort(displayRecords.players.gamesHighs, gamesBests, 'starters', ['weeks'], false, null, 'weeksStarted')}>filter_list</Icon>
                            </Cell>
                        </Row>
                    </Head>
                    <Body>
                        {#each gamesBests as player, ix (rand * (ix + 1))}
                            {#if rand == 0}
                                nothing
                            {:else}
                                <Row>
                                    <Cell class="rank">{ix + 1}</Cell>
                                    <Cell class="playerAvatar playerInfo" style="background-image: url('{player.avatar}'); vertical-align: middle; height: 45px; width: 45px; background-position: center; background-repeat: no-repeat; background-size: auto 45px;" />
                                    <Cell class="left">{player.playerInfo.fn} {player.playerInfo.ln}</Cell>
                                    <Cell class="center">
                                        <div class="pos {player.playerInfo.pos}">
                                            {player.playerInfo.pos}
                                        </div>
                                    </Cell>
                                    <Cell class="center">
                                        <img class="teamAvatar" src="https://sleepercdn.com/images/team_logos/nfl/{player.team.toLowerCase()}.png" alt="{player.team}">
                                    </Cell>
                                    <Cell class="cellName" on:click={() => gotoManager(player.recordManID)}>
                                        {player.manager.realname}
                                        {#if !allTime}
                                            <div class="fantasyTeamName">({player.manager.name})</div>
                                        {/if}
                                    </Cell>
                                    {#if allTime}
                                        <Cell class="center">{player.years.total}</Cell>
                                    {/if}
                                    <Cell class="center">{player.topStarters}</Cell>
                                    <Cell class="center">{player.bottomStarters}</Cell>
                                    <Cell class="center">{round(player.starterRankAVG)}</Cell>
                                    <Cell class="center">{round(player.fpts.starters.real)}</Cell>
                                    <Cell class="center">{round(player.fpts.starters.realPPG)}</Cell>
                                    <Cell class="center">{player.weeks.starters} / {player.weeks.total}</Cell>
                                </Row>
                            {/if}
                        {/each}
                    </Body>
                </DataTable>
            {/if}
        </div>

        <div class="rankingTableWrapper">
            {#if playerSeasonBests && playerSeasonBests.length}
                <DataTable class="rankingTable">
                    <Head>
                        <Row>
                            <Cell class="header" colspan=13>
                                <p>
                                    Personal Best Season-Long Scores – Players<br>
                                    {prefix} – {recordPrefix} 
                                </p>
                            </Cell>  
                        </Row>
                        <Row>
                            <Cell class="header rank"></Cell>
                            <Cell class="header rank" />
                            <Cell class="header">Player</Cell>
                            <Cell class="header">POS</Cell>
                            <Cell class="header">NFL Team</Cell>
                            <Cell class="header">Manager</Cell>
                            {#if allTime}
                                <Cell class="header">Year</Cell>
                            {/if}
                            <Cell class="header">
                                Led 
                                <br>
                                Team
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.managerBests.periodHighs, playerSeasonBests, 'topStarters', [], false, null, 'topStarters')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Team
                                <br> 
                                Bust
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.managerBests.periodHighs, playerSeasonBests, 'bottomStarters', [], false, null, 'bottomStarters')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Average
                                <br>
                                Team Rank
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.managerBests.periodHighs, playerSeasonBests, 'starterRankAVG', [], true, null, 'starterRankAVG')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Starts
                                <br>
                                / Owned
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.managerBests.periodHighs, playerSeasonBests, 'starters', ['weeks'], false, null, 'weeksStarted')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                PF
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.managerBests.periodHighs, playerSeasonBests, 'real', ['fpts', 'starters'], false, null, 'fpts')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                PPG
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.managerBests.periodHighs, playerSeasonBests, 'realPPG', ['fpts', 'starters'], false, null, 'fptspg')}>filter_list</Icon>
                            </Cell>
                        </Row>
                    </Head>
                    <Body>
                        {#each playerSeasonBests as playerATSeasonBest, ix (rand * (ix + 1))}
                            {#if rand == 0}
                                nothing
                            {:else}
                                <Row>
                                    <Cell class="rank">{ix + 1}</Cell>
                                    <Cell class="playerAvatar playerInfo" style="background-image: url('{playerATSeasonBest.avatar}'); vertical-align: middle; height: 45px; width: 45px; background-position: center; background-repeat: no-repeat; background-size: auto 45px;" />
                                    <Cell class="left">{playerATSeasonBest.playerInfo.fn} {playerATSeasonBest.playerInfo.ln}</Cell>
                                    <Cell class="center">
                                        <div class="pos {playerATSeasonBest.playerInfo.pos}">
                                            {playerATSeasonBest.playerInfo.pos}
                                        </div>
                                    </Cell>
                                    <Cell class="center">
                                        <img class="teamAvatar" src="https://sleepercdn.com/images/team_logos/nfl/{playerATSeasonBest.team.toLowerCase()}.png" alt="{playerATSeasonBest.team}">
                                    </Cell>
                                    <Cell class="cellName" on:click={() => gotoManager(playerATSeasonBest.recordManID)}>
                                        {playerATSeasonBest.manager.realname}
                                        {#if !allTime}
                                            <div class="fantasyTeamName">({playerATSeasonBest.manager.name})</div>
                                        {/if}
                                    </Cell>
                                    {#if allTime}
                                        <Cell class="center">{playerATSeasonBest.year}</Cell>
                                    {/if}
                                    <Cell class="center">{playerATSeasonBest.topStarters}</Cell>
                                    <Cell class="center">{playerATSeasonBest.bottomStarters}</Cell>
                                    <Cell class="center">{round(playerATSeasonBest.starterRankAVG)}</Cell>
                                    <Cell class="center">{playerATSeasonBest.weeks.starters} / {playerATSeasonBest.weeks.total}</Cell>
                                    <Cell class="center">{round(playerATSeasonBest.fpts.starters.real)}</Cell>
                                    <Cell class="center">{round(playerATSeasonBest.fpts.starters.realPPG)}</Cell>
                                </Row>
                            {/if}
                        {/each}
                    </Body>
                </DataTable>
            {/if}
        </div>

        <div class="rankingTableWrapper">
            {#if playerWeekBests && playerWeekBests.length}
                <DataTable class="rankingTable">
                    <Head>
                        <Row>
                            <Cell class="header" colspan=9>
                                <p>
                                    Personal Best Week Scores – Players<br>
                                    {prefix} – {recordPrefix} 
                                </p>
                            </Cell>  
                        </Row>
                        <Row>
                            <Cell class="header rank"></Cell>
                            <Cell class="header rank" />
                            <Cell class="header">Player</Cell>
                            <Cell class="header">POS</Cell>
                            <Cell class="header">NFL Team</Cell>
                            <Cell class="header">Manager</Cell>
                            {#if allTime}
                                <Cell class="header">Year</Cell>
                            {/if}
                            <Cell class="header">Week</Cell>
                            <Cell class="header">PF</Cell>
                        </Row>
                    </Head>
                    <Body>
                        {#each playerWeekBests as playerATWeekBest, ix}
                            <Row>
                                <Cell class="rank">{ix + 1}</Cell>
                                <Cell class="playerAvatar playerInfo" style="background-image: url('{playerATWeekBest.avatar}'); vertical-align: middle; height: 45px; width: 45px; background-position: center; background-repeat: no-repeat; background-size: auto 45px;" />
                                <Cell class="left">{playerATWeekBest.playerInfo.fn} {playerATWeekBest.playerInfo.ln}</Cell>
                                <Cell class="center">
                                    <div class="pos {playerATWeekBest.playerInfo.pos}">
                                        {playerATWeekBest.playerInfo.pos}
                                    </div>
                                </Cell>
                                <Cell class="center">
                                    <img class="teamAvatar" src="https://sleepercdn.com/images/team_logos/nfl/{playerATWeekBest.team.toLowerCase()}.png" alt="{playerATWeekBest.team}">
                                </Cell>
                                <Cell class="cellName" on:click={() => gotoManager(playerATWeekBest.recordManID)}>
                                    {playerATWeekBest.manager.realname}
                                    {#if !allTime}
                                        <div class="fantasyTeamName">({playerATWeekBest.manager.name})</div>
                                    {/if}
                                </Cell>
                                {#if allTime}
                                    <Cell class="center">{playerATWeekBest.year}</Cell>
                                {/if}
                                <Cell class="center">{playerATWeekBest.week}</Cell>
                                <Cell class="center">{round(playerATWeekBest.fpts)}</Cell>
                            </Row>
                        {/each}
                    </Body>
                </DataTable>
            {/if}
        </div>

        <div class="rankingTableWrapper">
            {#if seasonBestOvers && seasonBestOvers.length}
                <DataTable class="rankingTable">
                    <Head>
                        <Row>
                            <Cell class="header" colspan=13>
                                <p>
                                    Biggest Season-Long Breakouts<br>
                                    {prefix} – {recordPrefix} 
                                </p>
                            </Cell>  
                        </Row>
                        <Row>
                            <Cell class="header rank"></Cell>
                            <Cell class="header rank" />
                            <Cell class="header">Player</Cell>
                            <Cell class="header">POS</Cell>
                            <Cell class="header">NFL Team</Cell>
                            <Cell class="header">Manager</Cell>
                            {#if allTime}
                                <Cell class="header">Year</Cell>
                            {/if}
                            <Cell class="header">
                                Led Team
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.managerBests.seasonOvers, seasonBestOvers, 'topStarters', [], false, null, 'topStarters')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Avg Rank
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.managerBests.seasonOvers, seasonBestOvers, 'starterRankAVG', [], true, null, 'starterRankAVG')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Starts
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.managerBests.seasonOvers, seasonBestOvers, 'starters', ['weeks'], false, null, 'weeksStarted')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                PF
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.managerBests.seasonOvers, seasonBestOvers, 'real', ['fpts', 'starters'], false, null, 'fpts')}>filter_list</Icon>
                                <br>
                                (PPG)
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.managerBests.seasonOvers, seasonBestOvers, 'realPPG', ['fpts', 'starters'], false, null, 'fptspg')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Proj PF
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.managerBests.seasonOvers, seasonBestOvers, 'proj', ['fpts', 'starters'], false, null, 'projFpts')}>filter_list</Icon>
                                <br>
                                (PPG)
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.managerBests.seasonOvers, seasonBestOvers, 'projPPG', ['fpts', 'starters'], false, null, 'projFptsPg')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Diff
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.managerBests.seasonOvers, seasonBestOvers, 'diff', ['fpts', 'starters'], false, null, 'diff')}>filter_list</Icon>
                                <br>
                                Diff PG
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.managerBests.seasonOvers, seasonBestOvers, 'diffPG', ['fpts', 'starters'], false, null, 'diffpg')}>filter_list</Icon>
                            </Cell>
                        </Row>
                    </Head>
                    <Body>
                        {#each seasonBestOvers as seasonBestOver, ix (rand * (ix + 1))}
                            {#if rand == 0}
                                nothing
                            {:else}
                                <Row>
                                    <Cell class="rank">{ix + 1}</Cell>
                                    <Cell class="playerAvatar playerInfo" style="background-image: url('{seasonBestOver.avatar}'); vertical-align: middle; height: 45px; width: 45px; background-position: center; background-repeat: no-repeat; background-size: auto 45px;" />
                                    <Cell class="left">{seasonBestOver.playerInfo.fn} {seasonBestOver.playerInfo.ln}</Cell>
                                    <Cell class="center">
                                        <div class="pos {seasonBestOver.playerInfo.pos}">
                                            {seasonBestOver.playerInfo.pos}
                                        </div>
                                    </Cell>
                                    <Cell class="center">
                                        <img class="teamAvatar" src="https://sleepercdn.com/images/team_logos/nfl/{seasonBestOver.team.toLowerCase()}.png" alt="{seasonBestOver.team}">
                                    </Cell>
                                    <Cell class="cellName" on:click={() => gotoManager(seasonBestOver.recordManID)}>
                                        {seasonBestOver.manager.realname}
                                        {#if !allTime}
                                            <div class="fantasyTeamName">({seasonBestOver.manager.name})</div>
                                        {/if}
                                    </Cell>
                                    {#if allTime}
                                        <Cell class="center">{seasonBestOver.year}</Cell>
                                    {/if}
                                    <Cell class="center">{seasonBestOver.topStarters}</Cell>
                                    <Cell class="center">{round(seasonBestOver.starterRankAVG)}</Cell>
                                    <Cell class="center">{seasonBestOver.weeks.starters} / {seasonBestOver.weeks.total}</Cell>
                                    <Cell class="center">{round(seasonBestOver.fpts.starters.real)} <div style="font-size: 0.9em">{round(seasonBestOver.fpts.starters.realPPG)}</Cell>
                                    <Cell class="center">{round(seasonBestOver.fpts.starters.proj)} <div style="font-size: 0.9em">{round(seasonBestOver.fpts.starters.projPPG)}</Cell>
                                    <Cell class="center">{round(seasonBestOver.fpts.starters.diff)} <div style="font-size: 0.9em">{round(seasonBestOver.fpts.starters.diffPG)}</div></Cell>
                                </Row>
                            {/if}
                        {/each}
                    </Body>
                </DataTable>
            {/if}
        </div>

        <div class="rankingTableWrapper">
            {#if weekBestOvers && weekBestOvers.length}
                <DataTable class="rankingTable">
                    <Head>
                        <Row>
                            <Cell class="header" colspan=11>
                                <p>
                                    Biggest Single-Week Breakouts<br>
                                    {prefix} – {recordPrefix} 
                                </p>
                            </Cell>  
                        </Row>
                        <Row>
                            <Cell class="header rank"></Cell>
                            <Cell class="header rank" />
                            <Cell class="header">Player</Cell>
                            <Cell class="header">POS</Cell>
                            <Cell class="header">NFL Team</Cell>
                            <Cell class="header">Manager</Cell>
                            {#if allTime}
                                <Cell class="header">Year</Cell>
                            {/if}
                            <Cell class="header">Week</Cell>
                            <Cell class="header">
                                PF
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.managerBests.weekOvers, weekBestOvers, 'fpts', false, null, 'fpts')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Proj PF
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.managerBests.weekOvers, weekBestOvers, 'projFpts', false, null, 'projFpts')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Diff
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.managerBests.weekOvers, weekBestOvers, 'projDiff', false, null, 'projDiff')}>filter_list</Icon>
                            </Cell>
                        </Row>
                    </Head>
                    <Body>
                        {#each weekBestOvers as weekBestOver, ix (rand * (ix + 1))}
                            {#if rand == 0}
                                nothing
                            {:else}
                                <Row>
                                    <Cell class="rank">{ix + 1}</Cell>
                                    <Cell class="playerAvatar playerInfo" style="background-image: url('{weekBestOver.avatar}'); vertical-align: middle; height: 45px; width: 45px; background-position: center; background-repeat: no-repeat; background-size: auto 45px;" />
                                    <Cell class="left">{weekBestOver.playerInfo.fn} {weekBestOver.playerInfo.ln}</Cell>
                                    <Cell class="center">
                                        <div class="pos {weekBestOver.playerInfo.pos}">
                                            {weekBestOver.playerInfo.pos}
                                        </div>
                                    </Cell>
                                    <Cell class="center">
                                        <img class="teamAvatar" src="https://sleepercdn.com/images/team_logos/nfl/{weekBestOver.team.toLowerCase()}.png" alt="{weekBestOver.team}">
                                    </Cell>
                                    <Cell class="cellName" on:click={() => gotoManager(weekBestOver.recordManID)}>
                                        {weekBestOver.manager.realname}
                                        {#if !allTime}
                                            <div class="fantasyTeamName">({weekBestOver.manager.name})</div>
                                        {/if}
                                    </Cell>
                                    {#if allTime}
                                        <Cell class="center">{weekBestOver.year}</Cell>
                                    {/if}
                                    <Cell class="center">{weekBestOver.week}</Cell>
                                    <Cell class="center">{round(weekBestOver.fpts)}</Cell>
                                    <Cell class="center">{round(weekBestOver.projFpts)}</Cell>
                                    <Cell class="center">{round(weekBestOver.projDiff)}</Cell>
                                </Row>
                            {/if}
                        {/each}
                    </Body>
                </DataTable>
            {/if}
        </div>

        <div class="rankingTableWrapper">
            {#if seasonBestUnders && seasonBestUnders.length}
                <DataTable class="rankingTable">
                    <Head>
                        <Row>
                            <Cell class="header" colspan=14>
                                <p>
                                    Biggest Season-Long Busts<br>
                                    {prefix} – {recordPrefix} 
                                </p>
                            </Cell>  
                        </Row>
                        <Row>
                            <Cell class="header rank"></Cell>
                            <Cell class="header rank" />
                            <Cell class="header">Player</Cell>
                            <Cell class="header">POS</Cell>
                            <Cell class="header">NFL Team</Cell>
                            <Cell class="header">Manager</Cell>
                            {#if allTime}
                                <Cell class="header">Year</Cell>
                            {/if}
                            <Cell class="header">
                                Led Team
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.managerBests.seasonUnders, seasonBestUnders, 'topStarters', [], false, null, 'topStarters')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Team Bust
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.managerBests.seasonUnders, seasonBestUnders, 'bottomStarters', [], false, null, 'bottomStarters')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Avg Rank
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.managerBests.seasonUnders, seasonBestUnders, 'starterRankAVG', [], true, null, 'starterRankAVG')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Starts
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.managerBests.seasonUnders, seasonBestUnders, 'starters', ['weeks'], false, null, 'weeksStarted')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                PF
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.managerBests.seasonUnders, seasonBestUnders, 'real', ['fpts', 'starters'], false, null, 'fpts')}>filter_list</Icon>
                                <br>
                                (PPG)
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.managerBests.seasonUnders, seasonBestUnders, 'realPPG', ['fpts', 'starters'], false, null, 'fptspg')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Proj PF
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.managerBests.seasonUnders, seasonBestUnders, 'proj', ['fpts', 'starters'], false, null, 'projFpts')}>filter_list</Icon>
                                <br>
                                (PPG)
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.managerBests.seasonUnders, seasonBestUnders, 'projPPG', ['fpts', 'starters'], false, null, 'projFptsPg')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Diff
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.managerBests.seasonUnders, seasonBestUnders, 'diff', ['fpts', 'starters'], true, null, 'diff')}>filter_list</Icon>
                                <br>
                                Diff PG
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.managerBests.seasonUnders, seasonBestUnders, 'diffPG', ['fpts', 'starters'], true, null, 'diffpg')}>filter_list</Icon>
                            </Cell>
                        </Row>
                    </Head>
                    <Body>
                        {#each seasonBestUnders as seasonBestUnder, ix (rand * (ix + 1))}
                            {#if rand == 0}
                                nothing
                            {:else}
                                <Row>
                                    <Cell class="rank">{ix + 1}</Cell>
                                    <Cell class="playerAvatar playerInfo" style="background-image: url('{seasonBestUnder.avatar}'); vertical-align: middle; height: 45px; width: 45px; background-position: center; background-repeat: no-repeat; background-size: auto 45px;" />
                                    <Cell class="left">{seasonBestUnder.playerInfo.fn} {seasonBestUnder.playerInfo.ln}</Cell>
                                    <Cell class="center">
                                        <div class="pos {seasonBestUnder.playerInfo.pos}">
                                            {seasonBestUnder.playerInfo.pos}
                                        </div>
                                    </Cell>
                                    <Cell class="center">
                                        <img class="teamAvatar" src="https://sleepercdn.com/images/team_logos/nfl/{seasonBestUnder.team.toLowerCase()}.png" alt="{seasonBestUnder.team}">
                                    </Cell>
                                    <Cell class="cellName" on:click={() => gotoManager(seasonBestUnder.recordManID)}>
                                        {seasonBestUnder.manager.realname}
                                        {#if !allTime}
                                            <div class="fantasyTeamName">({seasonBestUnder.manager.name})</div>
                                        {/if}
                                    </Cell>
                                    {#if allTime}
                                        <Cell class="center">{seasonBestUnder.year}</Cell>
                                    {/if}
                                    <Cell class="center">{seasonBestUnder.topStarters}</Cell>
                                    <Cell class="center">{seasonBestUnder.bottomStarters}</Cell>
                                    <Cell class="center">{round(seasonBestUnder.starterRankAVG)}</Cell>
                                    <Cell class="center">{seasonBestUnder.weeks.starters} / {seasonBestUnder.weeks.total}</Cell>
                                    <Cell class="center">{round(seasonBestUnder.fpts.starters.real)} <div style="font-size: 0.9em">{round(seasonBestUnder.fpts.starters.realPPG)}</Cell>
                                    <Cell class="center">{round(seasonBestUnder.fpts.starters.proj)} <div style="font-size: 0.9em">{round(seasonBestUnder.fpts.starters.projPPG)}</Cell>
                                    <Cell class="center">{round(seasonBestUnder.fpts.starters.diff)} <div style="font-size: 0.9em">{round(seasonBestUnder.fpts.starters.diffPG)}</div></Cell>
                                </Row>
                            {/if}
                        {/each}
                    </Body>
                </DataTable>
            {/if}
        </div>

        <div class="rankingTableWrapper">
            {#if weekBestUnders && weekBestUnders.length}
                <DataTable class="rankingTable">
                    <Head>
                        <Row>
                            <Cell class="header" colspan=11>
                                <p>
                                    Biggest Single-Week Busts<br>
                                    {prefix} – {recordPrefix} 
                                </p>
                            </Cell>  
                        </Row>
                        <Row>
                            <Cell class="header rank"></Cell>
                            <Cell class="header rank" />
                            <Cell class="header">Player</Cell>
                            <Cell class="header">POS</Cell>
                            <Cell class="header">NFL Team</Cell>
                            <Cell class="header">Manager</Cell>
                            {#if allTime}
                                <Cell class="header">Year</Cell>
                            {/if}
                            <Cell class="header">Week</Cell>
                            <Cell class="header">
                                PF
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.managerBests.weekUnders, weekBestUnders, 'fpts', false, null, 'fpts')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Proj PF
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.managerBests.weekUnders, weekBestUnders, 'projFpts', false, null, 'projFpts')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                Diff
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.managerBests.weekUnders, weekBestUnders, 'projDiff', true, null, 'projDiff')}>filter_list</Icon>
                            </Cell>
                        </Row>
                    </Head>
                    <Body>
                        {#each weekBestUnders as weekBestUnder, ix (rand * (ix + 1))}
                            {#if rand == 0}
                                nothing
                            {:else}
                                <Row>
                                    <Cell class="rank">{ix + 1}</Cell>
                                    <Cell class="playerAvatar playerInfo" style="background-image: url('{weekBestUnder.avatar}'); vertical-align: middle; height: 45px; width: 45px; background-position: center; background-repeat: no-repeat; background-size: auto 45px;" />
                                    <Cell class="left">{weekBestUnder.playerInfo.fn} {weekBestUnder.playerInfo.ln}</Cell>
                                    <Cell class="center">
                                        <div class="pos {weekBestUnder.playerInfo.pos}">
                                            {weekBestUnder.playerInfo.pos}
                                        </div>
                                    </Cell>
                                    <Cell class="center">
                                        <img class="teamAvatar" src="https://sleepercdn.com/images/team_logos/nfl/{weekBestUnder.team.toLowerCase()}.png" alt="{weekBestUnder.team}">
                                    </Cell>
                                    <Cell class="cellName" on:click={() => gotoManager(weekBestUnder.recordManID)}>
                                        {weekBestUnder.manager.realname}
                                        {#if !allTime}
                                            <div class="fantasyTeamName">({weekBestUnder.manager.name})</div>
                                        {/if}
                                    </Cell>
                                    {#if allTime}
                                        <Cell class="center">{weekBestUnder.year}</Cell>
                                    {/if}
                                    <Cell class="center">{weekBestUnder.week}</Cell>
                                    <Cell class="center">{round(weekBestUnder.fpts)}</Cell>
                                    <Cell class="center">{round(weekBestUnder.projFpts)}</Cell>
                                    <Cell class="center">{round(weekBestUnder.projDiff)}</Cell>
                                </Row>
                            {/if}
                        {/each}
                    </Body>
                </DataTable>
            {/if}
        </div>

        <div class="rankingTableWrapper">
            {#if playerOverallMissedBests && playerOverallMissedBests.length}
                <DataTable class="rankingTable">
                    <Head>
                        <Row>
                            <Cell class="header" colspan=10>
                                <p>
                                    Top Cumulative Benchwarmers – Players<br>
                                    {prefix} – {recordPrefix} 
                                </p>
                            </Cell>  
                        </Row>
                        <Row>
                            <Cell class="header rank"></Cell>
                            <Cell class="header rank" />
                            <Cell class="header">Player</Cell>
                            <Cell class="header">POS</Cell>
                            <Cell class="header">NFL Team</Cell>
                            <Cell class="header">Manager</Cell>
                            {#if allTime}
                                <Cell class="header">Years</Cell>
                            {/if}
                            <Cell class="header">
                                Benched
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.managerBests.overallMissedHighs, playerOverallMissedBests, 'bench', ['weeks'], false, null, 'weeksBenched')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                BP
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.managerBests.overallMissedHighs, playerOverallMissedBests, 'real', ['fpts', 'bench'], false, null, 'benchPoints')}>filter_list</Icon>
                            </Cell>
                            <Cell class="header">
                                BPPG
                                <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.players.managerBests.overallMissedHighs, playerOverallMissedBests, 'realPPG', ['fpts', 'bench'], false, null, 'benchPPG')}>filter_list</Icon>
                            </Cell>
                        </Row>
                    </Head>
                    <Body>
                        {#each playerOverallMissedBests as playerOverallMissedBest, ix (rand * (ix + 1))}
                            {#if rand == 0}
                                nothing
                            {:else}
                                <Row>
                                    <Cell class="rank">{ix + 1}</Cell>
                                    <Cell class="playerAvatar playerInfo" style="background-image: url('{playerOverallMissedBest.avatar}'); vertical-align: middle; height: 45px; width: 45px; background-position: center; background-repeat: no-repeat; background-size: auto 45px;" />
                                    <Cell class="left">{playerOverallMissedBest.playerInfo.fn} {playerOverallMissedBest.playerInfo.ln}</Cell>
                                    <Cell class="center">
                                        <div class="pos {playerOverallMissedBest.playerInfo.pos}">
                                            {playerOverallMissedBest.playerInfo.pos}
                                        </div>
                                    </Cell>
                                    <Cell class="center">
                                        <img class="teamAvatar" src="https://sleepercdn.com/images/team_logos/nfl/{playerOverallMissedBest.team.toLowerCase()}.png" alt="{playerOverallMissedBest.team}">
                                    </Cell>
                                    <Cell class="cellName" on:click={() => gotoManager(playerOverallMissedBest.recordManID)}>
                                        {playerOverallMissedBest.manager.realname}
                                        {#if !allTime}
                                            <div class="fantasyTeamName">({playerOverallMissedBest.manager.name})</div>
                                        {/if}
                                    </Cell>
                                    {#if allTime}
                                        <Cell class="center">{playerOverallMissedBest.years.total}</Cell>
                                    {/if}
                                    <Cell class="center">{playerOverallMissedBest.weeks.bench} / {playerOverallMissedBest.weeks.total}</Cell>
                                    <Cell class="center">{round(playerOverallMissedBest.fpts.bench.real)}</Cell>
                                    <Cell class="center">{round(playerOverallMissedBest.fpts.bench.realPPG)}</Cell>
                                </Row>
                            {/if}
                        {/each}
                    </Body>
                </DataTable>
            {/if}
        </div>

        <div class="rankingTableWrapper">
            {#if playerWeekMissedBests && playerWeekMissedBests.length}
                <DataTable class="rankingTable">
                    <Head>
                        <Row>
                            <Cell class="header" colspan=9>
                                <p>
                                    Personal Biggest Benchwarmers – Players<br>
                                    {prefix} – {recordPrefix} 
                                </p>
                            </Cell>  
                        </Row>
                        <Row>
                            <Cell class="header rank"></Cell>
                            <Cell class="header rank" />
                            <Cell class="header">Player</Cell>
                            <Cell class="header">POS</Cell>
                            <Cell class="header">NFL Team</Cell>
                            <Cell class="header">Manager</Cell>
                            {#if allTime}
                                <Cell class="header">Year</Cell>
                            {/if}
                            <Cell class="header">Week</Cell>
                            <Cell class="header">PF</Cell>
                        </Row>
                    </Head>
                    <Body>
                        {#each playerWeekMissedBests as playerATWeekMissedBest, ix}
                            <Row>
                                <Cell class="rank">{ix + 1}</Cell>
                                <Cell class="playerAvatar playerInfo" style="background-image: url('{playerATWeekMissedBest.avatar}'); vertical-align: middle; height: 45px; width: 45px; background-position: center; background-repeat: no-repeat; background-size: auto 45px;" />
                                <Cell class="left">{playerATWeekMissedBest.playerInfo.fn} {playerATWeekMissedBest.playerInfo.ln}</Cell>
                                <Cell class="center">
                                    <div class="pos {playerATWeekMissedBest.playerInfo.pos}">
                                        {playerATWeekMissedBest.playerInfo.pos}
                                    </div>
                                </Cell>
                                <Cell class="center">
                                    <img class="teamAvatar" src="https://sleepercdn.com/images/team_logos/nfl/{playerATWeekMissedBest.team.toLowerCase()}.png" alt="{playerATWeekMissedBest.team}">
                                </Cell>
                                <Cell class="cellName" on:click={() => gotoManager(playerATWeekMissedBest.recordManID)}>
                                    {playerATWeekMissedBest.manager.realname}
                                    {#if !allTime}
                                        <div class="fantasyTeamName">({playerATWeekMissedBest.manager.name})</div>
                                    {/if}
                                </Cell>
                                {#if allTime}
                                    <Cell class="center">{playerATWeekMissedBest.year}</Cell>
                                {/if}
                                <Cell class="center">{playerATWeekMissedBest.week}</Cell>
                                <Cell class="center">{round(playerATWeekMissedBest.fpts)}</Cell>
                            </Row>
                        {/each}
                    </Body>
                </DataTable>
            {/if}
        </div>

        <div class="rankingTableWrapper">
            <DataTable class="rankingTable">
                <Head>
                    <Row>
                        <Cell class="header" colspan=9>
                            {prefix} Transaction Totals
                        </Cell>
                    </Row>
                    <Row>
                        <Cell class="header" colspan=2></Cell>
                        <Cell class="header" style="border-bottom: 0.25px solid var(--gcPlayText);" colspan=2>Wires</Cell>
                        <Cell class="header" colspan=3></Cell>
                    </Row>
                    <Row>
                        <Cell class="header" colspan=2></Cell>
                        <Cell class="header" style="border-bottom: 0.25px solid var(--gcPlayText);" colspan=3>Moves</Cell>
                        <Cell class="header" colspan=2></Cell>
                    </Row>
                    <Row>
                        <Cell class="header"></Cell>
                        <Cell class="header">Manager</Cell>
                        <Cell class="header">
                            Waivers
                            <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.transactions.transactions, transactions, 'waiver', false, null, 'waivers')}>filter_list</Icon>
                        </Cell>
                        <Cell class="header">
                            Free
                            <br>
                            Agents
                            <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.transactions.transactions, transactions, 'freeAgent', false, null, 'freeAgent')}>filter_list</Icon>
                        </Cell>
                        <Cell class="header">
                            Trades
                            <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.transactions.transactions, transactions, 'trade', false, null, 'trade')}>filter_list</Icon>
                        </Cell>
                        <Cell class="header">
                            Outbid
                            <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.transactions.transactions, transactions, 'outbid', false, null, 'outbid')}>filter_list</Icon>
                        </Cell>
                        <Cell class="header">
                            Bid
                            <br>
                            Win %
                            <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.transactions.transactions, transactions, 'waiverPerc', false, null, 'waiverPerc')}>filter_list</Icon>
                        </Cell>
                        <Cell class="header">
                            Wires
                            <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.transactions.transactions, transactions, 'wires', false, null, 'wires')}>filter_list</Icon>
                        </Cell>
                        <Cell class="header">
                            Moves
                            <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.transactions.transactions, transactions, 'moves', false, null, 'moves')}>filter_list</Icon>
                        </Cell>
                    </Row>
                </Head>
                <Body>
                    {#each transactions as transaction, ix (rand * (ix + 1))}
                        {#if rand == 0}
                            nothing
                        {:else}
                            <Row>
                                <Cell>{ix + 1}</Cell>
                                <Cell class="cellName" on:click={() => gotoManager(transaction.recordManID)}>
                                    {transaction.manager.realname}
                                    {#if !allTime}
                                        <div class="fantasyTeamName">({transaction.manager.name})</div>
                                    {/if}
                                </Cell>
                                <Cell class="center">{transaction.waiver}</Cell>
                                <Cell class="center">{transaction.freeAgent}</Cell>
                                <Cell class="center">{transaction.trade}</Cell>
                                <Cell class="center">{transaction.outbid}</Cell>
                                <Cell class="center">{transaction.waiverPerc == 'N/A' ? transaction.waiverPerc : round(transaction.waiverPerc)}</Cell>
                                <Cell class="center">{transaction.wires}</Cell>
                                <Cell class="center">{transaction.moves}</Cell>
                            </Row>
                        {/if}
                    {/each}
                </Body>
            </DataTable>
        </div>

        {#each playerPosGraphs as position, ix}
            <div class="rankingTableWrapper">
                {#if position.Overall.stats && position.Overall.stats.length}
                    <DataTable class="rankingTable">
                        <Head>
                            <Row>
                                <Cell class="header" colspan=12>
                                    <p>
                                        {#if allTime}
                                            Most Cumulative Points - {position.position}<br>
                                        {:else}
                                            Most Starter & Bench Points - {position.position}<br>
                                        {/if}
                                        {prefix} - {recordPrefix} 
                                    </p>
                                </Cell>  
                            </Row>
                            <Row>
                                <Cell class="header rank"></Cell>
                                <Cell class="header rank" />
                                <Cell class="header">Player</Cell>
                                {#if position.position != 'DEF'}
                                    <Cell class="header">NFL Team</Cell>
                                {/if}
                                <Cell class="header">Manager</Cell>
                                {#if allTime}
                                    <Cell class="header">Seasons</Cell>
                                {/if}
                                <Cell class="header">
                                    Led Team
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.positions[position.position].managerBests.overallHighs, playerPosGraphs[ix].Overall.stats, 'topStarters', [], false, null, 'topStarters')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    Team Bust
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.positions[position.position].managerBests.overallHighs, playerPosGraphs[ix].Overall.stats, 'bottomStarters', [], false, null, 'bottomStarters')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    Avg Rank
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.positions[position.position].managerBests.overallHighs, playerPosGraphs[ix].Overall.stats, 'starterRankAVG', [], true, null, 'starterRankAVG')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    Starts
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.positions[position.position].managerBests.overallHighs, playerPosGraphs[ix].Overall.stats, 'starters', ['weeks'], false, null, 'weeksStarted')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    PF
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.positions[position.position].managerBests.overallHighs, playerPosGraphs[ix].Overall.stats, 'real', ['fpts', 'starters'], false,  ['fpts', 'total'], 'fpts')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    PPG
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.positions[position.position].managerBests.overallHighs, playerPosGraphs[ix].Overall.stats, 'realPPG', ['fpts', 'starters'], false,  ['fpts', 'total'], 'fptspg')}>filter_list</Icon>
                                </Cell>
                            </Row>
                        </Head>
                        <Body>
                            {#each position.Overall.stats as player, ix (rand * (ix + 1))}
                                {#if rand == 0}
                                    nothing
                                {:else}
                                    <Row>
                                        <Cell class="rank">{ix + 1}</Cell>
                                        <Cell class="playerAvatar playerInfo" style="background-image: url('{player.avatar}'); vertical-align: middle; height: 45px; width: 45px; background-position: center; background-repeat: no-repeat; background-size: auto 45px;" />
                                        <Cell class="left">{player.playerInfo.fn} {player.playerInfo.ln}</Cell>
                                        {#if position.position != 'DEF'}
                                            <Cell class="center">
                                                <img class="teamAvatar" src="https://sleepercdn.com/images/team_logos/nfl/{player.team.toLowerCase()}.png" alt="{player.team}">
                                            </Cell>
                                        {/if}
                                        <Cell class="cellName" on:click={() => gotoManager(player.recordManID)}>
                                            {player.manager.realname}
                                            {#if !allTime}
                                                <div class="fantasyTeamName">({player.manager.name})</div>
                                            {/if}
                                        </Cell>
                                        {#if allTime}
                                            <Cell class="center">{player.years.total}</Cell>
                                        {/if}
                                        <Cell class="center">{player.topStarters}</Cell>
                                        <Cell class="center">{player.bottomStarters}</Cell>
                                        <Cell class="center">{round(player.starterRankAVG)}</Cell>
                                        <Cell class="center">{player.weeks.starters} / {player.weeks.total}</Cell>
                                        <Cell class="center">{round(player.fpts.starters.real)}</Cell>
                                        <Cell class="center">{round(player.fpts.starters.realPPG)}</Cell>
                                    </Row>
                                {/if}
                            {/each}
                        </Body>
                    </DataTable>
                {/if}
            </div>
            <div class="rankingTableWrapper">
                {#if position.Starts.stats && position.Starts.stats.length}
                    <DataTable class="rankingTable">
                        <Head>
                            <Row>
                                <Cell class="header" colspan=12>
                                    <p>
                                        Most Weeks Started - {position.position}<br>
                                        {prefix} - {recordPrefix} 
                                    </p>
                                </Cell>  
                            </Row>
                            <Row>
                                <Cell class="header rank"></Cell>
                                <Cell class="header rank" />
                                <Cell class="header">Player</Cell>
                                {#if position.position != 'DEF'}
                                    <Cell class="header">NFL Team</Cell>
                                {/if}
                                <Cell class="header">Manager</Cell>
                                {#if allTime}
                                    <Cell class="header">Seasons</Cell>
                                {/if}
                                <Cell class="header">
                                    Led Team
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.positions[position.position].managerBests.overallHighs, playerPosGraphs[ix].Overall.stats, 'topStarters', [], false, null, 'topStarters')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    Team Bust
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.positions[position.position].managerBests.overallHighs, playerPosGraphs[ix].Overall.stats, 'bottomStarters', [], false, null, 'bottomStarters')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    Avg Rank
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.positions[position.position].managerBests.overallHighs, playerPosGraphs[ix].Overall.stats, 'starterRankAVG', [], true, null, 'starterRankAVG')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    PF
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.positions[position.position].managerBests.overallHighs, playerPosGraphs[ix].Overall.stats, 'real', ['fpts', 'starters'], false, null, 'fpts')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    PPG
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.positions[position.position].managerBests.overallHighs, playerPosGraphs[ix].Overall.stats, 'realPPG',  ['fpts', 'starters'], false, null, 'fptspg')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    Starts
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.positions[position.position].managerBests.overallHighs, playerPosGraphs[ix].Overall.stats, 'starters', ['weeks'], false, null, 'weeksStarted')}>filter_list</Icon>
                                </Cell>
                            </Row>
                        </Head>
                        <Body>
                            {#each position.Starts.stats as player, ix (rand * (ix + 1))}
                                {#if rand == 0}
                                    nothing
                                {:else}
                                    <Row>
                                        <Cell class="rank">{ix + 1}</Cell>
                                        <Cell class="playerAvatar playerInfo" style="background-image: url('{player.avatar}'); vertical-align: middle; height: 45px; width: 45px; background-position: center; background-repeat: no-repeat; background-size: auto 45px;" />
                                        <Cell class="left">{player.playerInfo.fn} {player.playerInfo.ln}</Cell>
                                        {#if position.position != 'DEF'}
                                            <Cell class="center">
                                                <img class="teamAvatar" src="https://sleepercdn.com/images/team_logos/nfl/{player.team.toLowerCase()}.png" alt="{player.team}">
                                            </Cell>
                                        {/if}
                                        <Cell class="cellName" on:click={() => gotoManager(player.recordManID)}>
                                            {player.manager.realname}
                                            {#if !allTime}
                                                <div class="fantasyTeamName">({player.manager.name})</div>
                                            {/if}
                                        </Cell>
                                        {#if allTime}
                                            <Cell class="center">{player.years.total}</Cell>
                                        {/if}
                                        <Cell class="center">{player.topStarters}</Cell>
                                        <Cell class="center">{player.bottomStarters}</Cell>
                                        <Cell class="center">{round(player.starterRankAVG)}</Cell>
                                        <Cell class="center">{round(player.fpts.starters.real)}</Cell>
                                        <Cell class="center">{round(player.fpts.starters.realPPG)}</Cell>
                                        <Cell class="center">{player.weeks.starters} / {player.weeks.total}</Cell>
                                    </Row>
                                {/if}
                            {/each}
                        </Body>
                    </DataTable>
                {/if}
            </div>
            <div class="rankingTableWrapper">
                {#if position.Seasons.stats && position.Seasons.stats.length}
                    <DataTable class="rankingTable">
                        <Head>
                            <Row>
                                <Cell class="header" colspan=12>
                                    <p>
                                        Best Season-Long Performances - {position.position}<br>
                                        {prefix} – {recordPrefix} 
                                    </p>
                                </Cell>  
                            </Row>
                            <Row>
                                <Cell class="header rank"></Cell>
                                <Cell class="header rank" />
                                <Cell class="header">Player</Cell>
                                {#if position.position != 'DEF'}
                                    <Cell class="header">NFL Team</Cell>
                                {/if}
                                <Cell class="header">Manager</Cell>
                                {#if allTime}
                                    <Cell class="header">Year</Cell>
                                {/if}
                                <Cell class="header">
                                    Led Team
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.positions[position.position].managerBests.periodHighs, playerPosGraphs[ix].Seasons.stats, 'topStarters', [], false, null, 'topStarters')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    Team Bust
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.positions[position.position].managerBests.periodHighs, playerPosGraphs[ix].Seasons.stats, 'bottomStarters', [], false, null, 'bottomStarters')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    Avg Rank
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.positions[position.position].managerBests.periodHighs, playerPosGraphs[ix].Seasons.stats, 'starterRankAVG', [], true, null, 'starterRankAVG')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    Starts
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.positions[position.position].managerBests.periodHighs, playerPosGraphs[ix].Seasons.stats, 'starters', ['weeks'], false, null, 'weeksStarted')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    PF
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.positions[position.position].managerBests.periodHighs, playerPosGraphs[ix].Seasons.stats, 'real', ['fpts', 'starters'], false, null, 'fpts')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    PPG
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.positions[position.position].managerBests.periodHighs, playerPosGraphs[ix].Seasons.stats, 'realPPG', ['fpts', 'starters'], false, null, 'fptspg')}>filter_list</Icon>
                                </Cell>
                            </Row>
                        </Head>
                        <Body>
                            {#each position.Seasons.stats as player, ix (rand * (ix + 1))}
                                {#if rand == 0}
                                    nothing
                                {:else}
                                    <Row>
                                        <Cell class="rank">{ix + 1}</Cell>
                                        <Cell class="playerAvatar playerInfo" style="background-image: url('{player.avatar}'); vertical-align: middle; height: 45px; width: 45px; background-position: center; background-repeat: no-repeat; background-size: auto 45px;" />
                                        <Cell class="left">{player.playerInfo.fn} {player.playerInfo.ln}</Cell>
                                        {#if position.position != 'DEF'}
                                            <Cell class="center">
                                                <img class="teamAvatar" src="https://sleepercdn.com/images/team_logos/nfl/{player.team.toLowerCase()}.png" alt="{player.team}">
                                            </Cell>
                                        {/if}
                                        <Cell class="cellName" on:click={() => gotoManager(player.recordManID)}>
                                            {player.manager.realname}
                                            {#if !allTime}
                                                <div class="fantasyTeamName">({player.manager.name})</div>
                                            {/if}
                                        </Cell>
                                        {#if allTime}
                                            <Cell class="center">{player.year}</Cell>
                                        {/if}
                                        <Cell class="center">{player.topStarters}</Cell>
                                        <Cell class="center">{player.bottomStarters}</Cell>
                                        <Cell class="center">{round(player.starterRankAVG)}</Cell>
                                        <Cell class="center">{player.weeks.starters} / {player.weeks.total}</Cell>
                                        <Cell class="center">{round(player.fpts.starters.real)}</Cell>
                                        <Cell class="center">{round(player.fpts.starters.realPPG)}</Cell>
                                    </Row>
                                {/if}
                            {/each}
                        </Body>
                    </DataTable>
                {/if}
            </div>
            <div class="rankingTableWrapper">
                {#if position.Weeks.stats && position.Weeks.stats.length}
                    <DataTable class="rankingTable">
                        <Head>
                            <Row>
                                <Cell class="header" colspan=8>
                                    <p>
                                        Best Single-Week Performances – {position.position}<br>
                                        {prefix} – {recordPrefix} 
                                    </p>
                                </Cell>  
                            </Row>
                            <Row>
                                <Cell class="header rank"></Cell>
                                <Cell class="header rank" />
                                <Cell class="header">Player</Cell>
                                {#if position.position != 'DEF'}
                                    <Cell class="header">NFL Team</Cell>
                                {/if}
                                <Cell class="header">Manager</Cell>
                                {#if allTime}
                                    <Cell class="header">Year</Cell>
                                {/if}
                                <Cell class="header">Week</Cell>
                                <Cell class="header">PF</Cell>
                            </Row>
                        </Head>
                        <Body>
                            {#each position.Weeks.stats as player, ix}
                                <Row>
                                    <Cell class="rank">{ix + 1}</Cell>
                                    <Cell class="playerAvatar playerInfo" style="background-image: url('{player.avatar}'); vertical-align: middle; height: 45px; width: 45px; background-position: center; background-repeat: no-repeat; background-size: auto 45px;" />
                                    <Cell class="left">{player.playerInfo.fn} {player.playerInfo.ln}</Cell>
                                    {#if position.position != 'DEF'}
                                        <Cell class="center">
                                            <img class="teamAvatar" src="https://sleepercdn.com/images/team_logos/nfl/{player.team.toLowerCase()}.png" alt="{player.team}">
                                        </Cell>
                                    {/if}
                                    <Cell class="cellName" on:click={() => gotoManager(player.recordManID)}>
                                        {player.manager.realname}
                                        {#if !allTime}
                                            <div class="fantasyTeamName">({player.manager.name})</div>
                                        {/if}
                                    </Cell>
                                    {#if allTime}
                                        <Cell class="center">{player.year}</Cell>
                                    {/if}
                                    <Cell class="center">{player.week}</Cell>
                                    <Cell class="center">{round(player.fpts)}</Cell>
                                </Row>
                            {/each}
                        </Body>
                    </DataTable>
                {/if}
            </div>

            <div class="rankingTableWrapper">
                {#if position.SeasonOver.stats && position.SeasonOver.stats.length}
                    <DataTable class="rankingTable">
                        <Head>
                            <Row>
                                <Cell class="header" colspan=14>
                                    <p>
                                        Biggest Season-Long Breakouts – {position.position}<br>
                                        {prefix} – {recordPrefix} 
                                    </p>
                                </Cell>  
                            </Row>
                            <Row>
                                <Cell class="header rank"></Cell>
                                <Cell class="header rank" />
                                <Cell class="header">Player</Cell>
                                <Cell class="header">POS</Cell>
                                <Cell class="header">NFL Team</Cell>
                                <Cell class="header">Manager</Cell>
                                {#if allTime}
                                    <Cell class="header">Year</Cell>
                                {/if}
                                <Cell class="header">
                                    Led Team
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.positions[position.position].managerBests.seasonOvers, playerPosGraphs[ix].SeasonOver.stats, 'topStarters', [], false, null, 'topStarters')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    Team Bust
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.positions[position.position].managerBests.seasonOvers, playerPosGraphs[ix].SeasonOver.stats, 'bottomStarters', [], false, null, 'bottomStarters')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    Avg Rank
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.positions[position.position].managerBests.seasonOvers, playerPosGraphs[ix].SeasonOver.stats, 'starterRankAVG', [], true, null, 'starterRankAVG')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    Starts
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.positions[position.position].managerBests.seasonOvers, playerPosGraphs[ix].SeasonOver.stats, 'starters', ['weeks'], false, null, 'weeksStarted')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    PF
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.positions[position.position].managerBests.seasonOvers, playerPosGraphs[ix].SeasonOver.stats, 'real', ['fpts', 'starters'],false, null, 'fpts')}>filter_list</Icon>
                                    <br>
                                    (PPG)
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.positions[position.position].managerBests.seasonOvers, playerPosGraphs[ix].SeasonOver.stats, 'realPPG', ['fpts', 'starters'], false, null, 'fptspg')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    Proj PF
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.positions[position.position].managerBests.seasonOvers, playerPosGraphs[ix].SeasonOver.stats, 'proj', ['fpts', 'starters'], false, null, 'projFpts')}>filter_list</Icon>
                                    <br>
                                    (PPG)
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.positions[position.position].managerBests.seasonOvers, playerPosGraphs[ix].SeasonOver.stats, 'projPPG', ['fpts', 'starters'], false, null, 'projFptsPg')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    Diff
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.positions[position.position].managerBests.seasonOvers, playerPosGraphs[ix].SeasonOver.stats, 'diff', ['fpts', 'starters'], false, null, 'diff')}>filter_list</Icon>
                                    <br>
                                    Diff PG
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.positions[position.position].managerBests.seasonOvers, playerPosGraphs[ix].SeasonOver.stats, 'diffPG', ['fpts', 'starters'], false, null, 'diffpg')}>filter_list</Icon>
                                </Cell>
                            </Row>
                        </Head>
                        <Body>
                            {#each position.SeasonOver.stats as seasonBestOver, ix (rand * (ix + 1))}
                                {#if rand == 0}
                                    nothing
                                {:else}
                                    <Row>
                                        <Cell class="rank">{ix + 1}</Cell>
                                        <Cell class="playerAvatar playerInfo" style="background-image: url('{seasonBestOver.avatar}'); vertical-align: middle; height: 45px; width: 45px; background-position: center; background-repeat: no-repeat; background-size: auto 45px;" />
                                        <Cell class="left">{seasonBestOver.playerInfo.fn} {seasonBestOver.playerInfo.ln}</Cell>
                                        <Cell class="center">
                                            <div class="pos {seasonBestOver.playerInfo.pos}">
                                                {seasonBestOver.playerInfo.pos}
                                            </div>
                                        </Cell>
                                        <Cell class="center">
                                            <img class="teamAvatar" src="https://sleepercdn.com/images/team_logos/nfl/{seasonBestOver.team.toLowerCase()}.png" alt="{seasonBestOver.team}">
                                        </Cell>
                                        <Cell class="cellName" on:click={() => gotoManager(seasonBestOver.recordManID)}>
                                            {seasonBestOver.manager.realname}
                                            {#if !allTime}
                                                <div class="fantasyTeamName">({seasonBestOver.manager.name})</div>
                                            {/if}
                                        </Cell>
                                        {#if allTime}
                                            <Cell class="center">{seasonBestOver.year}</Cell>
                                        {/if}
                                        <Cell class="center">{seasonBestOver.topStarters}</Cell>
                                        <Cell class="center">{seasonBestOver.bottomStarters}</Cell>
                                        <Cell class="center">{round(seasonBestOver.starterRankAVG)}</Cell>
                                        <Cell class="center">{seasonBestOver.weeks.starters} / {seasonBestOver.weeks.total}</Cell>
                                        <Cell class="center">{round(seasonBestOver.fpts.starters.real)} <div style="font-size: 0.9em">{round(seasonBestOver.fpts.starters.realPPG)}</Cell>
                                        <Cell class="center">{round(seasonBestOver.fpts.starters.proj)} <div style="font-size: 0.9em">{round(seasonBestOver.fpts.starters.projPPG)}</Cell>
                                        <Cell class="center">{round(seasonBestOver.fpts.starters.diff)} <div style="font-size: 0.9em">{round(seasonBestOver.fpts.starters.diffPG)}</div></Cell>
                                    </Row>
                                {/if}
                            {/each}
                        </Body>
                    </DataTable>
                {/if}
            </div>
    
            <div class="rankingTableWrapper">
                {#if position.WeekOver.stats && position.WeekOver.stats.length}
                    <DataTable class="rankingTable">
                        <Head>
                            <Row>
                                <Cell class="header" colspan=11>
                                    <p>
                                        Biggest Single-Week Breakouts – {position.position}<br>
                                        {prefix} – {recordPrefix} 
                                    </p>
                                </Cell>  
                            </Row>
                            <Row>
                                <Cell class="header rank"></Cell>
                                <Cell class="header rank" />
                                <Cell class="header">Player</Cell>
                                <Cell class="header">POS</Cell>
                                <Cell class="header">NFL Team</Cell>
                                <Cell class="header">Manager</Cell>
                                {#if allTime}
                                    <Cell class="header">Year</Cell>
                                {/if}
                                <Cell class="header">Week</Cell>
                                <Cell class="header">
                                    PF
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.positions[position.position].managerBests.weekOvers, playerPosGraphs[ix].WeekOver.stats, 'fpts', false, null, 'fpts')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    Proj PF
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.positions[position.position].managerBests.weekOvers, playerPosGraphs[ix].WeekOver.stats, 'projFpts', false, null, 'projFpts')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    Diff
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.positions[position.position].managerBests.weekOvers, playerPosGraphs[ix].WeekOver.stats, 'projDiff', false, null, 'projDiff')}>filter_list</Icon>
                                </Cell>
                            </Row>
                        </Head>
                        <Body>
                            {#each position.WeekOver.stats as weekBestOver, ix (rand * (ix + 1))}
                                {#if rand == 0}
                                    nothing
                                {:else}
                                    <Row>
                                        <Cell class="rank">{ix + 1}</Cell>
                                        <Cell class="playerAvatar playerInfo" style="background-image: url('{weekBestOver.avatar}'); vertical-align: middle; height: 45px; width: 45px; background-position: center; background-repeat: no-repeat; background-size: auto 45px;" />
                                        <Cell class="left">{weekBestOver.playerInfo.fn} {weekBestOver.playerInfo.ln}</Cell>
                                        <Cell class="center">
                                            <div class="pos {weekBestOver.playerInfo.pos}">
                                                {weekBestOver.playerInfo.pos}
                                            </div>
                                        </Cell>
                                        <Cell class="center">
                                            <img class="teamAvatar" src="https://sleepercdn.com/images/team_logos/nfl/{weekBestOver.team.toLowerCase()}.png" alt="{weekBestOver.team}">
                                        </Cell>
                                        <Cell class="cellName" on:click={() => gotoManager(weekBestOver.recordManID)}>
                                            {weekBestOver.manager.realname}
                                            {#if !allTime}
                                                <div class="fantasyTeamName">({weekBestOver.manager.name})</div>
                                            {/if}
                                        </Cell>
                                        {#if allTime}
                                            <Cell class="center">{weekBestOver.year}</Cell>
                                        {/if}
                                        <Cell class="center">{weekBestOver.week}</Cell>
                                        <Cell class="center">{round(weekBestOver.fpts)}</Cell>
                                        <Cell class="center">{round(weekBestOver.projFpts)}</Cell>
                                        <Cell class="center">{round(weekBestOver.projDiff)}</Cell>
                                    </Row>
                                {/if}
                            {/each}
                        </Body>
                    </DataTable>
                {/if}
            </div>
    
            <div class="rankingTableWrapper">
                {#if position.SeasonUnder.stats && position.SeasonUnder.stats.length}
                    <DataTable class="rankingTable">
                        <Head>
                            <Row>
                                <Cell class="header" colspan=14>
                                    <p>
                                        Biggest Season-Long Busts – {position.position}<br>
                                        {prefix} – {recordPrefix} 
                                    </p>
                                </Cell>  
                            </Row>
                            <Row>
                                <Cell class="header rank"></Cell>
                                <Cell class="header rank" />
                                <Cell class="header">Player</Cell>
                                <Cell class="header">POS</Cell>
                                <Cell class="header">NFL Team</Cell>
                                <Cell class="header">Manager</Cell>
                                {#if allTime}
                                    <Cell class="header">Year</Cell>
                                {/if}
                                <Cell class="header">
                                    Led Team
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.positions[position.position].managerBests.seasonUnders, playerPosGraphs[ix].SeasonUnder.stats, 'topStarters', [], false, null, 'topStarters')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    Team Bust
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.positions[position.position].managerBests.seasonUnders, playerPosGraphs[ix].SeasonUnder.stats, 'bottomStarters', [], false, null, 'bottomStarters')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    Avg Rank
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.positions[position.position].managerBests.seasonUnders, playerPosGraphs[ix].SeasonUnder.stats, 'starterRankAVG', [], true, null, 'starterRankAVG')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    Starts
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.positions[position.position].managerBests.seasonUnders, playerPosGraphs[ix].SeasonUnder.stats, 'starters', ['weeks'], false, null, 'weeksStarted')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    PF
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.positions[position.position].managerBests.seasonUnders, playerPosGraphs[ix].SeasonUnder.stats, 'real', ['fpts', 'starters'], false, null, 'fpts')}>filter_list</Icon>
                                    <br>
                                    (PPG)
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.positions[position.position].managerBests.seasonUnders, playerPosGraphs[ix].SeasonUnder.stats, 'realPPG', ['fpts', 'starters'], false, null, 'fptspg')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    Proj PF
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.positions[position.position].managerBests.seasonUnders, playerPosGraphs[ix].SeasonUnder.stats, 'proj', ['fpts', 'starters'], false, null, 'projFpts')}>filter_list</Icon>
                                    <br>
                                    (PPG)
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.positions[position.position].managerBests.seasonUnders, playerPosGraphs[ix].SeasonUnder.stats, 'projPPG', ['fpts', 'starters'], false, null, 'projFptsPg')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    Diff
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.positions[position.position].managerBests.seasonUnders, playerPosGraphs[ix].SeasonUnder.stats, 'diff', ['fpts', 'starters'], true, null, 'diff')}>filter_list</Icon>
                                    <br>
                                    Diff PG
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.positions[position.position].managerBests.seasonUnders, playerPosGraphs[ix].SeasonUnder.stats, 'diffPG', ['fpts', 'starters'], true, null, 'diffpg')}>filter_list</Icon>
                                </Cell>
                            </Row>
                        </Head>
                        <Body>
                            {#each position.SeasonUnder.stats as seasonBestUnder, ix (rand * (ix + 1))}
                                {#if rand == 0}
                                    nothing
                                {:else}
                                    <Row>
                                        <Cell class="rank">{ix + 1}</Cell>
                                        <Cell class="playerAvatar playerInfo" style="background-image: url('{seasonBestUnder.avatar}'); vertical-align: middle; height: 45px; width: 45px; background-position: center; background-repeat: no-repeat; background-size: auto 45px;" />
                                        <Cell class="left">{seasonBestUnder.playerInfo.fn} {seasonBestUnder.playerInfo.ln}</Cell>
                                        <Cell class="center">
                                            <div class="pos {seasonBestUnder.playerInfo.pos}">
                                                {seasonBestUnder.playerInfo.pos}
                                            </div>
                                        </Cell>
                                        <Cell class="center">
                                            <img class="teamAvatar" src="https://sleepercdn.com/images/team_logos/nfl/{seasonBestUnder.team.toLowerCase()}.png" alt="{seasonBestUnder.team}">
                                        </Cell>
                                        <Cell class="cellName" on:click={() => gotoManager(seasonBestUnder.recordManID)}>
                                            {seasonBestUnder.manager.realname}
                                            {#if !allTime}
                                                <div class="fantasyTeamName">({seasonBestUnder.manager.name})</div>
                                            {/if}
                                        </Cell>
                                        {#if allTime}
                                            <Cell class="center">{seasonBestUnder.year}</Cell>
                                        {/if}
                                        <Cell class="center">{seasonBestUnder.topStarters}</Cell>
                                        <Cell class="center">{seasonBestUnder.bottomStarters}</Cell>
                                        <Cell class="center">{round(seasonBestUnder.starterRankAVG)}</Cell>
                                        <Cell class="center">{seasonBestUnder.weeks.starters} / {seasonBestUnder.weeks.total}</Cell>
                                        <Cell class="center">{round(seasonBestUnder.fpts.starters.real)} <div style="font-size: 0.9em">{round(seasonBestUnder.fpts.starters.realPPG)}</Cell>
                                        <Cell class="center">{round(seasonBestUnder.fpts.starters.proj)} <div style="font-size: 0.9em">{round(seasonBestUnder.fpts.starters.projPPG)}</Cell>
                                        <Cell class="center">{round(seasonBestUnder.fpts.starters.diff)} <div style="font-size: 0.9em">{round(seasonBestUnder.fpts.starters.diffPG)}</div></Cell>
                                    </Row>
                                {/if}
                            {/each}
                        </Body>
                    </DataTable>
                {/if}
            </div>
    
            <div class="rankingTableWrapper">
                {#if position.WeekUnder.stats && position.WeekUnder.stats.length}
                    <DataTable class="rankingTable">
                        <Head>
                            <Row>
                                <Cell class="header" colspan=11>
                                    <p>
                                        Biggest Single-Week Busts – {position.position}<br>
                                        {prefix} – {recordPrefix} 
                                    </p>
                                </Cell>  
                            </Row>
                            <Row>
                                <Cell class="header rank"></Cell>
                                <Cell class="header rank" />
                                <Cell class="header">Player</Cell>
                                <Cell class="header">POS</Cell>
                                <Cell class="header">NFL Team</Cell>
                                <Cell class="header">Manager</Cell>
                                {#if allTime}
                                    <Cell class="header">Year</Cell>
                                {/if}
                                <Cell class="header">Week</Cell>
                                <Cell class="header">
                                    PF
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.positions[position.position].managerBests.weekUnders, playerPosGraphs[ix].WeekUnder.stats, 'fpts', false, null, 'fpts')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    Proj PF
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.positions[position.position].managerBests.weekUnders, playerPosGraphs[ix].WeekUnder.stats, 'projFpts', false, null, 'projFpts')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    Diff
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.positions[position.position].managerBests.weekUnders, playerPosGraphs[ix].WeekUnder.stats, 'projDiff', true, null, 'projDiff')}>filter_list</Icon>
                                </Cell>
                            </Row>
                        </Head>
                        <Body>
                            {#each position.WeekUnder.stats as weekBestUnder, ix (rand * (ix + 1))}
                                {#if rand == 0}
                                    nothing
                                {:else}
                                    <Row>
                                        <Cell class="rank">{ix + 1}</Cell>
                                        <Cell class="playerAvatar playerInfo" style="background-image: url('{weekBestUnder.avatar}'); vertical-align: middle; height: 45px; width: 45px; background-position: center; background-repeat: no-repeat; background-size: auto 45px;" />
                                        <Cell class="left">{weekBestUnder.playerInfo.fn} {weekBestUnder.playerInfo.ln}</Cell>
                                        <Cell class="center">
                                            <div class="pos {weekBestUnder.playerInfo.pos}">
                                                {weekBestUnder.playerInfo.pos}
                                            </div>
                                        </Cell>
                                        <Cell class="center">
                                            <img class="teamAvatar" src="https://sleepercdn.com/images/team_logos/nfl/{weekBestUnder.team.toLowerCase()}.png" alt="{weekBestUnder.team}">
                                        </Cell>
                                        <Cell class="cellName" on:click={() => gotoManager(weekBestUnder.recordManID)}>
                                            {weekBestUnder.manager.realname}
                                            {#if !allTime}
                                                <div class="fantasyTeamName">({weekBestUnder.manager.name})</div>
                                            {/if}
                                        </Cell>
                                        {#if allTime}
                                            <Cell class="center">{weekBestUnder.year}</Cell>
                                        {/if}
                                        <Cell class="center">{weekBestUnder.week}</Cell>
                                        <Cell class="center">{round(weekBestUnder.fpts)}</Cell>
                                        <Cell class="center">{round(weekBestUnder.projFpts)}</Cell>
                                        <Cell class="center">{round(weekBestUnder.projDiff)}</Cell>
                                    </Row>
                                {/if}
                            {/each}
                        </Body>
                    </DataTable>
                {/if}
            </div>

            <div class="rankingTableWrapper">
                {#if position.Bench.stats && position.Bench.stats.length}
                    <DataTable class="rankingTable">
                        <Head>
                            <Row>
                                <Cell class="header" colspan=9>
                                    <p>
                                        Top Cumulative Benchwarmers – {position.position}<br>
                                        {prefix} – {recordPrefix} 
                                    </p>
                                </Cell>  
                            </Row>
                            <Row>
                                <Cell class="header rank"></Cell>
                                <Cell class="header rank" />
                                <Cell class="header">Player</Cell>
                                <Cell class="header">NFL Team</Cell>
                                <Cell class="header">Manager</Cell>
                                {#if allTime}
                                    <Cell class="header">Seasons</Cell>
                                {/if}
                                <Cell class="header">
                                    Benched
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.positions[position.position].managerBests.overallMissedHighs, playerPosGraphs[ix].Bench.stats, 'bench', ['weeks'], false, null, 'weeksBenched')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    BP
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.positions[position.position].managerBests.overallMissedHighs, playerPosGraphs[ix].Bench.stats, 'real', ['fpts', 'bench'], false, null, 'benchPoints')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    BPPG
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.positions[position.position].managerBests.overallMissedHighs, playerPosGraphs[ix].Bench.stats, 'realPPG', ['fpts', 'bench'], false, null, 'benchPPG')}>filter_list</Icon>
                                </Cell>
                            </Row>
                        </Head>
                        <Body>
                            {#each position.Bench.stats as player, ix (rand * (ix + 1))}
                                {#if rand == 0}
                                    nothing
                                {:else}
                                    <Row>
                                        <Cell class="rank">{ix + 1}</Cell>
                                        <Cell class="playerAvatar playerInfo" style="background-image: url('{player.avatar}'); vertical-align: middle; height: 45px; width: 45px; background-position: center; background-repeat: no-repeat; background-size: auto 45px;" />
                                        <Cell class="left">{player.playerInfo.fn} {player.playerInfo.ln}</Cell>
                                        <Cell class="center">
                                            <img class="teamAvatar" src="https://sleepercdn.com/images/team_logos/nfl/{player.team.toLowerCase()}.png" alt="{player.team}">
                                        </Cell>
                                        <Cell class="cellName" on:click={() => gotoManager(player.recordManID)}>
                                            {player.manager.realname}
                                            {#if !allTime}
                                                <div class="fantasyTeamName">({player.manager.name})</div>
                                            {/if}
                                        </Cell>
                                        {#if allTime}
                                            <Cell class="center">{player.years.total}</Cell>
                                        {/if}
                                        <Cell class="center">{player.weeks.bench} / {player.weeks.total}</Cell>
                                        <Cell class="center">{round(player.fpts.bench.real)}</Cell>
                                        <Cell class="center">{round(player.fpts.bench.realPPG)}</Cell>
                                    </Row>
                                {/if}
                            {/each}
                        </Body>
                    </DataTable>
                {/if}
            </div>
            <div class="rankingTableWrapper">
                {#if position.BenchWeek.stats && position.BenchWeek.stats.length}
                    <DataTable class="rankingTable">
                        <Head>
                            <Row>
                                <Cell class="header" colspan=8>
                                    <p>
                                        Top Single-Week Benchwarmers – {position.position}<br>
                                        {prefix} – {recordPrefix} 
                                    </p>
                                </Cell>  
                            </Row>
                            <Row>
                                <Cell class="header rank"></Cell>
                                <Cell class="header rank" />
                                <Cell class="header">Player</Cell>
                                <Cell class="header">NFL Team</Cell>
                                <Cell class="header">Manager</Cell>
                                {#if allTime}
                                    <Cell class="header">Year</Cell>
                                {/if}
                                <Cell class="header">Week</Cell>
                                <Cell class="header">BP</Cell>
                            </Row>
                        </Head>
                        <Body>
                            {#each position.BenchWeek.stats as player, ix (rand * (ix + 1))}
                                {#if rand == 0}
                                    nothing
                                {:else}
                                    <Row>
                                        <Cell class="rank">{ix + 1}</Cell>
                                        <Cell class="playerAvatar playerInfo" style="background-image: url('{player.avatar}'); vertical-align: middle; height: 45px; width: 45px; background-position: center; background-repeat: no-repeat; background-size: auto 45px;" />
                                        <Cell class="left">{player.playerInfo.fn} {player.playerInfo.ln}</Cell>
                                        <Cell class="center">
                                            <img class="teamAvatar" src="https://sleepercdn.com/images/team_logos/nfl/{player.team.toLowerCase()}.png" alt="{player.team}">
                                        </Cell>
                                        <Cell class="cellName" on:click={() => gotoManager(player.recordManID)}>
                                            {player.manager.realname}
                                            {#if !allTime}
                                                <div class="fantasyTeamName">({player.manager.name})</div>
                                            {/if}
                                        </Cell>
                                        {#if allTime}
                                            <Cell class="center">{player.year}</Cell>
                                        {/if}
                                        <Cell class="center">{player.week}</Cell>
                                        <Cell class="center">{round(player.fpts)}</Cell>
                                    </Row>
                                {/if}
                            {/each}
                        </Body>
                    </DataTable>
                {/if}
            </div>
            <div class="rankingTableWrapper">
                {#if position.Averages.stats && position.Averages.stats.length}
                    <DataTable class="rankingTable">
                        <Head>
                            <Row>
                                <Cell class="header" colspan=5>
                                    <p>
                                        Positional Scoring Averages – {position.position}<br>
                                        {prefix} – {recordPrefix} 
                                    </p>
                                </Cell>  
                            </Row>
                            <Row>
                                <Cell class="header rank"></Cell>
                                <Cell class="header">Manager</Cell>
                                <Cell class="header">
                                    PF Share
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.positions[position.position].leagueAverages.managerAverages, playerPosGraphs[ix].Averages.stats, 'perc', false, null, 'perc')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    PF
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.positions[position.position].leagueAverages.managerAverages, playerPosGraphs[ix].Averages.stats, 'real', false, null, 'real')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    PPG
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.positions[position.position].leagueAverages.managerAverages, playerPosGraphs[ix].Averages.stats, 'realPPG', false, null, 'realPPG')}>filter_list</Icon>
                                </Cell>
                            </Row>
                        </Head>
                        <Body>
                            {#each position.Averages.stats as player, ix (rand * (ix + 1))}
                                {#if rand == 0}
                                    nothing
                                {:else}
                                    <Row>
                                        <Cell class="rank">{ix + 1}</Cell>
                                        <Cell class="cellName" on:click={() => gotoManager(player.recordManID)}>
                                            {player.manager.realname}
                                            {#if !allTime}
                                                <div class="fantasyTeamName">({player.manager.name})</div>
                                            {/if}
                                        </Cell>
                                        <Cell class="center">{round(player.perc)}</Cell>
                                        <Cell class="center">{round(player.real)}</Cell>
                                        <Cell class="center">{round(player.realPPG)}</Cell>
                                    </Row>
                                {/if}
                            {/each}
                        </Body>
                    </DataTable>
                {/if}
            </div>
        {/each}

        {#each playerAcqGraphs as acquisition, ix}
            <div class="rankingTableWrapper">
                {#if acquisition.Overall.stats && acquisition.Overall.stats.length}
                    <DataTable class="rankingTable">
                        <Head>
                            <Row>
                                <Cell class="header" colspan=13>
                                    <p>
                                        {#if allTime}
                                            Most Cumulative Points from Players Acquired by {capitalizeFirstLetter(acquisition.transType)}<br>
                                        {:else}
                                            Most Starter & Bench Pts from Players Acquired by {capitalizeFirstLetter(acquisition.transType)}<br>
                                        {/if}
                                        {prefix} - {recordPrefix} 
                                    </p>
                                </Cell>  
                            </Row>
                            <Row>
                                <Cell class="header rank"></Cell>
                                <Cell class="header rank" />
                                <Cell class="header">Player</Cell>
                                <Cell class="header">POS</Cell>
                                <Cell class="header">NFL Team</Cell>
                                <Cell class="header">Manager</Cell>
                                {#if allTime}
                                    <Cell class="header">Seasons</Cell>
                                {/if}
                                <Cell class="header">
                                    Led Team
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.acquisitions[acquisition.transType].managerBests.overallHighs, playerAcqGraphs[ix].Overall.stats, 'topStarters', [],  false, null, 'topStarters')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    Team Bust
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.acquisitions[acquisition.transType].managerBests.overallHighs, playerAcqGraphs[ix].Overall.stats, 'bottomStarters', [],  false, null, 'bottomStarters')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    Avg Rank
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.acquisitions[acquisition.transType].managerBests.overallHighs, playerAcqGraphs[ix].Overall.stats, 'starterRankAVG', [], true, null, 'starterRankAVG')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    Starts
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.acquisitions[acquisition.transType].managerBests.overallHighs, playerAcqGraphs[ix].Overall.stats, 'weeks', ['fpts', 'trans', acquisition.transType, 'starters'], false, null, 'weeksStarted')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    PF
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.acquisitions[acquisition.transType].managerBests.overallHighs, playerAcqGraphs[ix].Overall.stats, 'real', ['fpts', 'trans', acquisition.transType, 'starters'], false, ['fpts', 'trans', acquisition.transType, 'total'], false, null, 'fpts')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    PPG
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.acquisitions[acquisition.transType].managerBests.overallHighs, playerAcqGraphs[ix].Overall.stats, 'realPPG', ['fpts', 'trans', acquisition.transType, 'starters'], false, ['fpts', 'trans', acquisition.transType, 'total'], false, null, 'fptspg')}>filter_list</Icon>
                                </Cell>
                            </Row>
                        </Head>
                        <Body>
                            {#each acquisition.Overall.stats as player, ix (rand * (ix + 1))}
                                {#if rand == 0}
                                    nothing
                                {:else}
                                    <Row>
                                        <Cell class="rank">{ix + 1}</Cell>
                                        <Cell class="playerAvatar playerInfo" style="background-image: url('{player.avatar}'); vertical-align: middle; height: 45px; width: 45px; background-position: center; background-repeat: no-repeat; background-size: auto 45px;" />
                                        <Cell class="left">{player.playerInfo.fn} {player.playerInfo.ln}</Cell>
                                        <Cell class="center">
                                            <div class="pos {player.playerInfo.pos}">
                                                {player.playerInfo.pos}
                                            </div>
                                        </Cell>
                                        <Cell class="center">
                                            <img class="teamAvatar" src="https://sleepercdn.com/images/team_logos/nfl/{player.team.toLowerCase()}.png" alt="{player.team}">
                                        </Cell>
                                        <Cell class="cellName" on:click={() => gotoManager(player.recordManID)}>
                                            {player.manager.realname}
                                            {#if !allTime}
                                                <div class="fantasyTeamName">({player.manager.name})</div>
                                            {/if}
                                        </Cell>
                                        {#if allTime}
                                            <Cell class="center">{player.years.total}</Cell>
                                        {/if}
                                        <Cell class="center">{player.topStarters}</Cell>
                                        <Cell class="center">{player.bottomStarters}</Cell>
                                        <Cell class="center">{round(player.starterRankAVG)}</Cell>
                                        <Cell class="center">{player.fpts.trans[acquisition.transType].starters.weeks} / {player.fpts.trans[acquisition.transType].total.weeks}</Cell>
                                        <Cell class="center">{allTime ? round(player.fpts.trans[acquisition.transType].total.real) : round(player.fpts.trans[acquisition.transType].total.real)}</Cell>
                                        <Cell class="center">{allTime ? round(player.fpts.trans[acquisition.transType].starters.realPPG) : round(player.fpts.trans[acquisition.transType].total.realPPG)}</Cell>
                                    </Row>
                                {/if}
                            {/each}
                        </Body>
                    </DataTable>
                {/if}
            </div>
            <div class="rankingTableWrapper">
                {#if acquisition.Starts.stats && acquisition.Starts.stats.length}
                    <DataTable class="rankingTable">
                        <Head>
                            <Row>
                                <Cell class="header" colspan=13>
                                    <p>
                                        Most Weeks Started for Players Acquired by {capitalizeFirstLetter(acquisition.transType)}<br>
                                        {prefix} - {recordPrefix} 
                                    </p>
                                </Cell>  
                            </Row>
                            <Row>
                                <Cell class="header rank"></Cell>
                                <Cell class="header rank" />
                                <Cell class="header">Player</Cell>
                                <Cell class="header">POS</Cell>
                                <Cell class="header">NFL Team</Cell>
                                <Cell class="header">Manager</Cell>
                                {#if allTime}
                                    <Cell class="header">Seasons</Cell>
                                {/if}
                                <Cell class="header">
                                    Led Team
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.acquisitions[acquisition.transType].managerBests.gamesHighs, playerPosGraphs[ix].Overall.stats, 'topStarters', [], false, null, 'topStarters')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    Team Bust
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.acquisitions[acquisition.transType].managerBests.gamesHighs, playerPosGraphs[ix].Overall.stats, 'bottomStarters', [], false, null, 'bottomStarters')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    Avg Rank
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.acquisitions[acquisition.transType].managerBests.gamesHighs, playerPosGraphs[ix].Overall.stats, 'starterRankAVG', [], true, null, 'starterRankAVG')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    PF
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.acquisitions[acquisition.transType].managerBests.gamesHighs, playerPosGraphs[ix].Overall.stats, 'real', ['fpts', 'trans', acquisition.transType, 'starters'], false, null, 'fpts')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    PPG
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.acquisitions[acquisition.transType].managerBests.gamesHighs, playerPosGraphs[ix].Overall.stats, 'realPPG', ['fpts', 'trans', acquisition.transType, 'starters'], false, null, 'fptspg')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    Starts
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.acquisitions[acquisition.transType].managerBests.gamesHighs, playerPosGraphs[ix].Overall.stats, 'weeks', ['fpts', 'trans', acquisition.transType, 'starters'], false, null, 'weeksStarted')}>filter_list</Icon>
                                </Cell>                            
                            </Row>
                        </Head>
                        <Body>
                            {#each acquisition.Starts.stats as player, ix}
                                <Row>
                                    <Cell class="rank">{ix + 1}</Cell>
                                    <Cell class="playerAvatar playerInfo" style="background-image: url('{player.avatar}'); vertical-align: middle; height: 45px; width: 45px; background-position: center; background-repeat: no-repeat; background-size: auto 45px;" />
                                    <Cell class="left">{player.playerInfo.fn} {player.playerInfo.ln}</Cell>
                                    <Cell class="center">
                                        <div class="pos {player.playerInfo.pos}">
                                            {player.playerInfo.pos}
                                        </div>
                                    </Cell>
                                    <Cell class="center">
                                        <img class="teamAvatar" src="https://sleepercdn.com/images/team_logos/nfl/{player.team.toLowerCase()}.png" alt="{player.team}">
                                    </Cell>
                                    <Cell class="cellName" on:click={() => gotoManager(player.recordManID)}>
                                        {player.manager.realname}
                                        {#if !allTime}
                                            <div class="fantasyTeamName">({player.manager.name})</div>
                                        {/if}
                                    </Cell>
                                    {#if allTime}
                                        <Cell class="center">{player.years.total}</Cell>
                                    {/if}
                                    <Cell class="center">{player.topStarters}</Cell>
                                    <Cell class="center">{player.bottomStarters}</Cell>
                                    <Cell class="center">{round(player.starterRankAVG)}</Cell>
                                    <Cell class="center">{round(player.fpts.trans[acquisition.transType].starters.real)}</Cell>
                                    <Cell class="center">{round(player.fpts.trans[acquisition.transType].starters.realPPG)}</Cell>
                                    <Cell class="center">{player.fpts.trans[acquisition.transType].starters.weeks} / {player.fpts.trans[acquisition.transType].total.weeks}</Cell>
                                </Row>
                            {/each}
                        </Body>
                    </DataTable>
                {/if}
            </div>
            <div class="rankingTableWrapper">
                {#if acquisition.Seasons.stats && acquisition.Seasons.stats.length}
                    <DataTable class="rankingTable">
                        <Head>
                            <Row>
                                <Cell class="header" colspan=13>
                                    <p>
                                        Best Season-Long Performances from Players Acquired by {capitalizeFirstLetter(acquisition.transType)}<br>
                                        {prefix} – {recordPrefix} 
                                    </p>
                                </Cell>  
                            </Row>
                            <Row>
                                <Cell class="header rank"></Cell>
                                <Cell class="header rank" />
                                <Cell class="header">Player</Cell>
                                <Cell class="header">POS</Cell>
                                <Cell class="header">NFL Team</Cell>
                                <Cell class="header">Manager</Cell>
                                {#if allTime}
                                    <Cell class="header">Year</Cell>
                                {/if}
                                <Cell class="header">
                                    Led Team
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.acquisitions[acquisition.transType].managerBests.periodHighs, playerAcqGraphs[ix].Seasons.stats, 'topStarters', [], false, null, 'topStarters')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    Team Bust
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.acquisitions[acquisition.transType].managerBests.periodHighs, playerAcqGraphs[ix].Seasons.stats, 'bottomStarters', [], false, null, 'bottomStarters')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    Avg Rank
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.acquisitions[acquisition.transType].managerBests.periodHighs, playerAcqGraphs[ix].Seasons.stats, 'starterRankAVG', [], true, null, 'starterRankAVG')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    Starts
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.acquisitions[acquisition.transType].managerBests.periodHighs, playerAcqGraphs[ix].Seasons.stats, 'weeks', ['fpts', 'trans', acquisition.transType, 'starters'], false, null, 'weeksStarted')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    PF
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.acquisitions[acquisition.transType].managerBests.periodHighs, playerAcqGraphs[ix].Seasons.stats, 'real', ['fpts', 'trans', acquisition.transType, 'starters'], false, null, 'fpts')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    PPG
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.acquisitions[acquisition.transType].managerBests.periodHighs, playerAcqGraphs[ix].Seasons.stats, 'realPPG', ['fpts', 'trans', acquisition.transType, 'starters'],false, null, 'fptspg')}>filter_list</Icon>
                                </Cell>
                            </Row>
                        </Head>
                        <Body>
                            {#each acquisition.Seasons.stats as player, ix (rand * (ix + 1))}
                                {#if rand == 0}
                                    nothing
                                {:else}
                                    <Row>
                                        <Cell class="rank">{ix + 1}</Cell>
                                        <Cell class="playerAvatar playerInfo" style="background-image: url('{player.avatar}'); vertical-align: middle; height: 45px; width: 45px; background-position: center; background-repeat: no-repeat; background-size: auto 45px;" />
                                        <Cell class="left">{player.playerInfo.fn} {player.playerInfo.ln}</Cell>
                                        <Cell class="center">
                                            <div class="pos {player.playerInfo.pos}">
                                                {player.playerInfo.pos}
                                            </div>
                                        </Cell>
                                        <Cell class="center">
                                            <img class="teamAvatar" src="https://sleepercdn.com/images/team_logos/nfl/{player.team.toLowerCase()}.png" alt="{player.team}">
                                        </Cell>
                                        <Cell class="cellName" on:click={() => gotoManager(player.recordManID)}>
                                            {player.manager.realname}
                                            {#if !allTime}
                                                <div class="fantasyTeamName">({player.manager.name})</div>
                                            {/if}
                                        </Cell>
                                        {#if allTime}
                                            <Cell class="center">{player.year}</Cell>
                                        {/if}
                                        <Cell class="center">{player.topStarters}</Cell>
                                        <Cell class="center">{player.bottomStarters}</Cell>
                                        <Cell class="center">{round(player.starterRankAVG)}</Cell>
                                        <Cell class="center">{player.fpts.trans[acquisition.transType].starters.weeks} / {player.fpts.trans[acquisition.transType].total.weeks}</Cell>
                                        <Cell class="center">{round(player.fpts.trans[acquisition.transType].starters.real)}</Cell>
                                        <Cell class="center">{round(player.fpts.trans[acquisition.transType].starters.realPPG)}</Cell>
                                    </Row>
                                {/if}
                            {/each}
                        </Body>
                    </DataTable>
                {/if}
            </div>
            <div class="rankingTableWrapper">
                {#if acquisition.Weeks.stats && acquisition.Weeks.stats.length}
                    <DataTable class="rankingTable">
                        <Head>
                            <Row>
                                <Cell class="header" colspan=9>
                                    <p>
                                        Best Single-Week Performances from Players Acquired by {capitalizeFirstLetter(acquisition.transType)}<br>
                                        {prefix} - {recordPrefix} 
                                    </p>
                                </Cell>  
                            </Row>
                            <Row>
                                <Cell class="header rank"></Cell>
                                <Cell class="header rank" />
                                <Cell class="header">Player</Cell>
                                <Cell class="header">POS</Cell>
                                <Cell class="header">NFL Team</Cell>
                                <Cell class="header">Manager</Cell>
                                {#if allTime}
                                    <Cell class="header">Year</Cell>
                                {/if}
                                <Cell class="header">Week</Cell>
                                <Cell class="header">PF</Cell>
                            </Row>
                        </Head>
                        <Body>
                            {#each acquisition.Weeks.stats as player, ix}
                                <Row>
                                    <Cell class="rank">{ix + 1}</Cell>
                                    <Cell class="playerAvatar playerInfo" style="background-image: url('{player.avatar}'); vertical-align: middle; height: 45px; width: 45px; background-position: center; background-repeat: no-repeat; background-size: auto 45px;" />
                                    <Cell class="left">{player.playerInfo.fn} {player.playerInfo.ln}</Cell>
                                    <Cell class="center">
                                        <div class="pos {player.playerInfo.pos}">
                                            {player.playerInfo.pos}
                                        </div>
                                    </Cell>
                                    <Cell class="center">
                                        <img class="teamAvatar" src="https://sleepercdn.com/images/team_logos/nfl/{player.team.toLowerCase()}.png" alt="{player.team}">
                                    </Cell>
                                    <Cell class="cellName" on:click={() => gotoManager(player.recordManID)}>
                                        {player.manager.realname}
                                        {#if !allTime}
                                            <div class="fantasyTeamName">({player.manager.name})</div>
                                        {/if}
                                    </Cell>
                                    {#if allTime}
                                        <Cell class="center">{player.year}</Cell>
                                    {/if}
                                    <Cell class="center">{player.week}</Cell>
                                    <Cell class="center">{round(player.fpts)}</Cell>
                                </Row>
                            {/each}
                        </Body>
                    </DataTable>
                {/if}
            </div>
            <div class="rankingTableWrapper">
                {#if acquisition.SeasonOver.stats && acquisition.SeasonOver.stats.length}
                    <DataTable class="rankingTable">
                        <Head>
                            <Row>
                                <Cell class="header" colspan=14>
                                    <p>
                                        Biggest Season-Long Breakouts – {capitalizeFirstLetter(acquisition.transType)}<br>
                                        {prefix} – {recordPrefix} 
                                    </p>
                                </Cell>  
                            </Row>
                            <Row>
                                <Cell class="header rank"></Cell>
                                <Cell class="header rank" />
                                <Cell class="header">Player</Cell>
                                <Cell class="header">POS</Cell>
                                <Cell class="header">NFL Team</Cell>
                                <Cell class="header">Manager</Cell>
                                {#if allTime}
                                    <Cell class="header">Year</Cell>
                                {/if}
                                <Cell class="header">
                                    Led Team
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.acquisitions[acquisition.transType].managerBests.seasonOvers, playerAcqGraphs[ix].SeasonOver.stats, 'topStarters', [], false, null, 'topStarters')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    Team Bust
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.acquisitions[acquisition.transType].managerBests.seasonOvers, playerAcqGraphs[ix].SeasonOver.stats, 'bottomStarters', [], false, null, 'bottomStarters')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    Avg Rank
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.acquisitions[acquisition.transType].managerBests.seasonOvers, playerAcqGraphs[ix].SeasonOver.stats, 'starterRankAVG', [], true, null, 'starterRankAVG')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    Starts
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.acquisitions[acquisition.transType].managerBests.seasonOvers, playerAcqGraphs[ix].SeasonOver.stats, 'weeks', ['fpts', 'trans', acquisition.transType, 'starters'], false, null, 'weeksStarted')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    PF
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.acquisitions[acquisition.transType].managerBests.seasonOvers, playerAcqGraphs[ix].SeasonOver.stats, 'real', ['fpts', 'trans', acquisition.transType, 'starters'], false, null, 'fpts')}>filter_list</Icon>
                                    <br>
                                    (PPG)
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.acquisitions[acquisition.transType].managerBests.seasonOvers, playerAcqGraphs[ix].SeasonOver.stats, 'realPPG', ['fpts', 'trans', acquisition.transType, 'starters'], false, null, 'fptspg')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    Proj PF
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.acquisitions[acquisition.transType].managerBests.seasonOvers, playerAcqGraphs[ix].SeasonOver.stats, 'proj', ['fpts', 'trans', acquisition.transType, 'starters'], false, null, 'projFpts')}>filter_list</Icon>
                                    <br>
                                    (PPG)
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.acquisitions[acquisition.transType].managerBests.seasonOvers, playerAcqGraphs[ix].SeasonOver.stats, 'projPPG', ['fpts', 'trans', acquisition.transType, 'starters'], false, null, 'projFptsPg')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    Diff
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.acquisitions[acquisition.transType].managerBests.seasonOvers, playerAcqGraphs[ix].SeasonOver.stats, 'diff', ['fpts', 'trans', acquisition.transType, 'starters'], false, null, 'diff')}>filter_list</Icon>
                                    <br>
                                    Diff PG
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.acquisitions[acquisition.transType].managerBests.seasonOvers, playerAcqGraphs[ix].SeasonOver.stats, 'diffPG', ['fpts', 'trans', acquisition.transType, 'starters'], false, null, 'diffpg')}>filter_list</Icon>
                                </Cell>
                            </Row>
                        </Head>
                        <Body>
                            {#each acquisition.SeasonOver.stats as seasonBestOver, ix (rand * (ix + 1))}
                                {#if rand == 0}
                                    nothing
                                {:else}
                                    <Row>
                                        <Cell class="rank">{ix + 1}</Cell>
                                        <Cell class="playerAvatar playerInfo" style="background-image: url('{seasonBestOver.avatar}'); vertical-align: middle; height: 45px; width: 45px; background-position: center; background-repeat: no-repeat; background-size: auto 45px;" />
                                        <Cell class="left">{seasonBestOver.playerInfo.fn} {seasonBestOver.playerInfo.ln}</Cell>
                                        <Cell class="center">
                                            <div class="pos {seasonBestOver.playerInfo.pos}">
                                                {seasonBestOver.playerInfo.pos}
                                            </div>
                                        </Cell>
                                        <Cell class="center">
                                            <img class="teamAvatar" src="https://sleepercdn.com/images/team_logos/nfl/{seasonBestOver.team.toLowerCase()}.png" alt="{seasonBestOver.team}">
                                        </Cell>
                                        <Cell class="cellName" on:click={() => gotoManager(seasonBestOver.recordManID)}>
                                            {seasonBestOver.manager.realname}
                                            {#if !allTime}
                                                <div class="fantasyTeamName">({seasonBestOver.manager.name})</div>
                                            {/if}
                                        </Cell>
                                        {#if allTime}
                                            <Cell class="center">{seasonBestOver.year}</Cell>
                                        {/if}
                                        <Cell class="center">{seasonBestOver.topStarters}</Cell>
                                        <Cell class="center">{seasonBestOver.bottomStarters}</Cell>
                                        <Cell class="center">{round(seasonBestOver.starterRankAVG)}</Cell>
                                        <Cell class="center">{seasonBestOver.fpts.trans[acquisition.transType].starters.weeks} / {seasonBestOver.fpts.trans[acquisition.transType].total.weeks}</Cell>
                                        <Cell class="center">{round(seasonBestOver.fpts.trans[acquisition.transType].starters.real)} <div style="font-size: 0.9em">{round(seasonBestOver.fpts.trans[acquisition.transType].starters.realPPG)}</Cell>
                                        <Cell class="center">{round(seasonBestOver.fpts.trans[acquisition.transType].starters.proj)} <div style="font-size: 0.9em">{round(seasonBestOver.fpts.trans[acquisition.transType].starters.projPPG)}</Cell>
                                        <Cell class="center">{round(seasonBestOver.fpts.trans[acquisition.transType].starters.diff)} <div style="font-size: 0.9em">{round(seasonBestOver.fpts.trans[acquisition.transType].starters.diffPG)}</div></Cell>
                                    </Row>
                                {/if}
                            {/each}
                        </Body>
                    </DataTable>
                {/if}
            </div>
    
            <div class="rankingTableWrapper">
                {#if acquisition.WeekOver.stats && acquisition.WeekOver.stats.length}
                    <DataTable class="rankingTable">
                        <Head>
                            <Row>
                                <Cell class="header" colspan=11>
                                    <p>
                                        Biggest Single-Week Breakouts – {capitalizeFirstLetter(acquisition.transType)}<br>
                                        {prefix} – {recordPrefix} 
                                    </p>
                                </Cell>  
                            </Row>
                            <Row>
                                <Cell class="header rank"></Cell>
                                <Cell class="header rank" />
                                <Cell class="header">Player</Cell>
                                <Cell class="header">POS</Cell>
                                <Cell class="header">NFL Team</Cell>
                                <Cell class="header">Manager</Cell>
                                {#if allTime}
                                    <Cell class="header">Year</Cell>
                                {/if}
                                <Cell class="header">Week</Cell>
                                <Cell class="header">
                                    PF
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.acquisitions[acquisition.transType].managerBests.weekOvers, playerAcqGraphs[ix].WeekOver.stats, 'fpts', false, null, 'fpts')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    Proj PF
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.acquisitions[acquisition.transType].managerBests.weekOvers, playerAcqGraphs[ix].WeekOver.stats, 'projFpts', false, null, 'projFpts')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    Diff
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.acquisitions[acquisition.transType].managerBests.weekOvers, playerAcqGraphs[ix].WeekOver.stats, 'projDiff', false, null, 'projDiff')}>filter_list</Icon>
                                </Cell>
                            </Row>
                        </Head>
                        <Body>
                            {#each acquisition.WeekOver.stats as weekBestOver, ix (rand * (ix + 1))}
                                {#if rand == 0}
                                    nothing
                                {:else}
                                    <Row>
                                        <Cell class="rank">{ix + 1}</Cell>
                                        <Cell class="playerAvatar playerInfo" style="background-image: url('{weekBestOver.avatar}'); vertical-align: middle; height: 45px; width: 45px; background-position: center; background-repeat: no-repeat; background-size: auto 45px;" />
                                        <Cell class="left">{weekBestOver.playerInfo.fn} {weekBestOver.playerInfo.ln}</Cell>
                                        <Cell class="center">
                                            <div class="pos {weekBestOver.playerInfo.pos}">
                                                {weekBestOver.playerInfo.pos}
                                            </div>
                                        </Cell>
                                        <Cell class="center">
                                            <img class="teamAvatar" src="https://sleepercdn.com/images/team_logos/nfl/{weekBestOver.team.toLowerCase()}.png" alt="{weekBestOver.team}">
                                        </Cell>
                                        <Cell class="cellName" on:click={() => gotoManager(weekBestOver.recordManID)}>
                                            {weekBestOver.manager.realname}
                                            {#if !allTime}
                                                <div class="fantasyTeamName">({weekBestOver.manager.name})</div>
                                            {/if}
                                        </Cell>
                                        {#if allTime}
                                            <Cell class="center">{weekBestOver.year}</Cell>
                                        {/if}
                                        <Cell class="center">{weekBestOver.week}</Cell>
                                        <Cell class="center">{round(weekBestOver.fpts)}</Cell>
                                        <Cell class="center">{round(weekBestOver.projFpts)}</Cell>
                                        <Cell class="center">{round(weekBestOver.projDiff)}</Cell>
                                    </Row>
                                {/if}
                            {/each}
                        </Body>
                    </DataTable>
                {/if}
            </div>
    
            <div class="rankingTableWrapper">
                {#if acquisition.SeasonUnder.stats && acquisition.SeasonUnder.stats.length}
                    <DataTable class="rankingTable">
                        <Head>
                            <Row>
                                <Cell class="header" colspan=14>
                                    <p>
                                        Biggest Season-Long Busts from Players Acquired by {capitalizeFirstLetter(acquisition.transType)}<br>
                                        {prefix} – {recordPrefix} 
                                    </p>
                                </Cell>  
                            </Row>
                            <Row>
                                <Cell class="header rank"></Cell>
                                <Cell class="header rank" />
                                <Cell class="header">Player</Cell>
                                <Cell class="header">POS</Cell>
                                <Cell class="header">NFL Team</Cell>
                                <Cell class="header">Manager</Cell>
                                {#if allTime}
                                    <Cell class="header">Year</Cell>
                                {/if}
                                <Cell class="header">
                                    Led Team
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.acquisitions[acquisition.transType].managerBests.seasonUnders, playerAcqGraphs[ix].SeasonUnder.stats, 'topStarters', [], false, null, 'topStarters')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    Team Bust
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.acquisitions[acquisition.transType].managerBests.seasonUnders, playerAcqGraphs[ix].SeasonUnder.stats, 'bottomStarters', [], false, null, 'bottomStarters')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    Avg Rank
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.acquisitions[acquisition.transType].managerBests.seasonUnders, playerAcqGraphs[ix].SeasonUnder.stats, 'starterRankAVG', [], true, null, 'starterRankAVG')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    Starts
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.acquisitions[acquisition.transType].managerBests.seasonUnders, playerAcqGraphs[ix].SeasonUnder.stats, 'weeks', ['fpts', 'trans', acquisition.transType, 'starters'], false, null, 'weeksStarted')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    PF
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.acquisitions[acquisition.transType].managerBests.seasonUnders, playerAcqGraphs[ix].SeasonUnder.stats, 'real', ['fpts', 'trans', acquisition.transType, 'starters'], false, null, 'fpts')}>filter_list</Icon>
                                    <br>
                                    (PPG)
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.acquisitions[acquisition.transType].managerBests.seasonUnders, playerAcqGraphs[ix].SeasonUnder.stats, 'realPPG', ['fpts', 'trans', acquisition.transType, 'starters'], false, null, 'fptspg')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    Proj PF
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.acquisitions[acquisition.transType].managerBests.seasonUnders, playerAcqGraphs[ix].SeasonUnder.stats, 'proj', ['fpts', 'trans', acquisition.transType, 'starters'], false, null, 'projFpts')}>filter_list</Icon>
                                    <br>
                                    (PPG)
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.acquisitions[acquisition.transType].managerBests.seasonUnders, playerAcqGraphs[ix].SeasonUnder.stats, 'projPPG', ['fpts', 'trans', acquisition.transType, 'starters'], false, null, 'projFptsPg')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    Diff
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.acquisitions[acquisition.transType].managerBests.seasonUnders, playerAcqGraphs[ix].SeasonUnder.stats, 'diff', ['fpts', 'trans', acquisition.transType, 'starters'], true, null, 'diff')}>filter_list</Icon>
                                    <br>
                                    Diff PG
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.acquisitions[acquisition.transType].managerBests.seasonUnders, playerAcqGraphs[ix].SeasonUnder.stats, 'diffPG', ['fpts', 'trans', acquisition.transType, 'starters'], true, null, 'diffpg')}>filter_list</Icon>
                                </Cell>
                            </Row>
                        </Head>
                        <Body>
                            {#each acquisition.SeasonUnder.stats as seasonBestUnder, ix (rand * (ix + 1))}
                                {#if rand == 0}
                                    nothing
                                {:else}
                                    <Row>
                                        <Cell class="rank">{ix + 1}</Cell>
                                        <Cell class="playerAvatar playerInfo" style="background-image: url('{seasonBestUnder.avatar}'); vertical-align: middle; height: 45px; width: 45px; background-position: center; background-repeat: no-repeat; background-size: auto 45px;" />
                                        <Cell class="left">{seasonBestUnder.playerInfo.fn} {seasonBestUnder.playerInfo.ln}</Cell>
                                        <Cell class="center">
                                            <div class="pos {seasonBestUnder.playerInfo.pos}">
                                                {seasonBestUnder.playerInfo.pos}
                                            </div>
                                        </Cell>
                                        <Cell class="center">
                                            <img class="teamAvatar" src="https://sleepercdn.com/images/team_logos/nfl/{seasonBestUnder.team.toLowerCase()}.png" alt="{seasonBestUnder.team}">
                                        </Cell>
                                        <Cell class="cellName" on:click={() => gotoManager(seasonBestUnder.recordManID)}>
                                            {seasonBestUnder.manager.realname}
                                            {#if !allTime}
                                                <div class="fantasyTeamName">({seasonBestUnder.manager.name})</div>
                                            {/if}
                                        </Cell>
                                        {#if allTime}
                                            <Cell class="center">{seasonBestUnder.year}</Cell>
                                        {/if}
                                        <Cell class="center">{seasonBestUnder.topStarters}</Cell>
                                        <Cell class="center">{seasonBestUnder.bottomStarters}</Cell>
                                        <Cell class="center">{round(seasonBestUnder.starterRankAVG)}</Cell>
                                        <Cell class="center">{seasonBestUnder.fpts.trans[acquisition.transType].starters.weeks} / {seasonBestUnder.fpts.trans[acquisition.transType].total.weeks}</Cell>
                                        <Cell class="center">{round(seasonBestUnder.fpts.trans[acquisition.transType].starters.real)} <div style="font-size: 0.9em">{round(seasonBestUnder.fpts.trans[acquisition.transType].starters.realPPG)}</Cell>
                                        <Cell class="center">{round(seasonBestUnder.fpts.trans[acquisition.transType].starters.proj)} <div style="font-size: 0.9em">{round(seasonBestUnder.fpts.trans[acquisition.transType].starters.projPPG)}</Cell>
                                        <Cell class="center">{round(seasonBestUnder.fpts.trans[acquisition.transType].starters.diff)} <div style="font-size: 0.9em">{round(seasonBestUnder.fpts.trans[acquisition.transType].starters.diffPG)}</div></Cell>
                                    </Row>
                                {/if}
                            {/each}
                        </Body>
                    </DataTable>
                {/if}
            </div>
    
            <div class="rankingTableWrapper">
                {#if acquisition.WeekUnder.stats && acquisition.WeekUnder.stats.length}
                    <DataTable class="rankingTable">
                        <Head>
                            <Row>
                                <Cell class="header" colspan=11>
                                    <p>
                                        Biggest Single-Week Busts from Players Acquired by {capitalizeFirstLetter(acquisition.transType)}<br>
                                        {prefix} – {recordPrefix} 
                                    </p>
                                </Cell>  
                            </Row>
                            <Row>
                                <Cell class="header rank"></Cell>
                                <Cell class="header rank" />
                                <Cell class="header">Player</Cell>
                                <Cell class="header">POS</Cell>
                                <Cell class="header">NFL Team</Cell>
                                <Cell class="header">Manager</Cell>
                                {#if allTime}
                                    <Cell class="header">Year</Cell>
                                {/if}
                                <Cell class="header">Week</Cell>
                                <Cell class="header">
                                    PF
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.acquisitions[acquisition.transType].managerBests.weekUnders, playerAcqGraphs[ix].WeekUnder.stats, 'fpts', false, null, 'fpts')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    Proj PF
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.acquisitions[acquisition.transType].managerBests.weekUnders, playerAcqGraphs[ix].WeekUnder.stats, 'projFpts', false, null, 'projFpts')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    Diff
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.acquisitions[acquisition.transType].managerBests.weekUnders, playerAcqGraphs[ix].WeekUnder.stats, 'projDiff', true, null, 'projDiff')}>filter_list</Icon>
                                </Cell>
                            </Row>
                        </Head>
                        <Body>
                            {#each acquisition.WeekUnder.stats as weekBestUnder, ix (rand * (ix + 1))}
                                {#if rand == 0}
                                    nothing
                                {:else}
                                    <Row>
                                        <Cell class="rank">{ix + 1}</Cell>
                                        <Cell class="playerAvatar playerInfo" style="background-image: url('{weekBestUnder.avatar}'); vertical-align: middle; height: 45px; width: 45px; background-position: center; background-repeat: no-repeat; background-size: auto 45px;" />
                                        <Cell class="left">{weekBestUnder.playerInfo.fn} {weekBestUnder.playerInfo.ln}</Cell>
                                        <Cell class="center">
                                            <div class="pos {weekBestUnder.playerInfo.pos}">
                                                {weekBestUnder.playerInfo.pos}
                                            </div>
                                        </Cell>
                                        <Cell class="center">
                                            <img class="teamAvatar" src="https://sleepercdn.com/images/team_logos/nfl/{weekBestUnder.team.toLowerCase()}.png" alt="{weekBestUnder.team}">
                                        </Cell>
                                        <Cell class="cellName" on:click={() => gotoManager(weekBestUnder.recordManID)}>
                                            {weekBestUnder.manager.realname}
                                            {#if !allTime}
                                                <div class="fantasyTeamName">({weekBestUnder.manager.name})</div>
                                            {/if}
                                        </Cell>
                                        {#if allTime}
                                            <Cell class="center">{weekBestUnder.year}</Cell>
                                        {/if}
                                        <Cell class="center">{weekBestUnder.week}</Cell>
                                        <Cell class="center">{round(weekBestUnder.fpts)}</Cell>
                                        <Cell class="center">{round(weekBestUnder.projFpts)}</Cell>
                                        <Cell class="center">{round(weekBestUnder.projDiff)}</Cell>
                                    </Row>
                                {/if}
                            {/each}
                        </Body>
                    </DataTable>
                {/if}
            </div>

            <div class="rankingTableWrapper">
                {#if acquisition.Bench.stats && acquisition.Bench.stats.length}
                    <DataTable class="rankingTable">
                        <Head>
                            <Row>
                                <Cell class="header" colspan=10>
                                    <p>
                                        Most Cumulative Bench Points from Players Acquired by {capitalizeFirstLetter(acquisition.transType)}<br>
                                        {prefix} – {recordPrefix} 
                                    </p>
                                </Cell>  
                            </Row>
                            <Row>
                                <Cell class="header rank"></Cell>
                                <Cell class="header rank" />
                                <Cell class="header">Player</Cell>
                                <Cell class="header">POS</Cell>
                                <Cell class="header">NFL Team</Cell>
                                <Cell class="header">Manager</Cell>
                                {#if allTime}
                                    <Cell class="header">Seasons</Cell>
                                {/if}
                                <Cell class="header">
                                    Benched
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.acquisitions[acquisition.transType].managerBests.overallMissedHighs, playerAcqGraphs[ix].Bench.stats, 'weeks', ['fpts', 'trans', acquisition.transType, 'bench'], false, null, 'weeksBenched')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    BP
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.acquisitions[acquisition.transType].managerBests.overallMissedHighs, playerAcqGraphs[ix].Bench.stats, 'real', ['fpts', 'trans', acquisition.transType, 'bench'], false, null, 'benchPoints')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    BPPG
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.acquisitions[acquisition.transType].managerBests.overallMissedHighs, playerAcqGraphs[ix].Bench.stats, 'realPPG', ['fpts', 'trans', acquisition.transType, 'bench'], false, null, 'benchPPG')}>filter_list</Icon>
                                </Cell>
                            </Row>
                        </Head>
                        <Body>
                            {#each acquisition.Bench.stats as player, ix (rand * (ix + 1))}
                                {#if rand == 0}
                                    nothing
                                {:else}
                                    <Row>
                                        <Cell class="rank">{ix + 1}</Cell>
                                        <Cell class="playerAvatar playerInfo" style="background-image: url('{player.avatar}'); vertical-align: middle; height: 45px; width: 45px; background-position: center; background-repeat: no-repeat; background-size: auto 45px;" />
                                        <Cell class="left">{player.playerInfo.fn} {player.playerInfo.ln}</Cell>
                                        <Cell class="center">
                                            <div class="pos {player.playerInfo.pos}">
                                                {player.playerInfo.pos}
                                            </div>
                                        </Cell>
                                        <Cell class="center">
                                            <img class="teamAvatar" src="https://sleepercdn.com/images/team_logos/nfl/{player.team.toLowerCase()}.png" alt="{player.team}">
                                        </Cell>
                                        <Cell class="cellName" on:click={() => gotoManager(player.recordManID)}>
                                            {player.manager.realname}
                                            {#if !allTime}
                                                <div class="fantasyTeamName">({player.manager.name})</div>
                                            {/if}
                                        </Cell>
                                        {#if allTime}
                                            <Cell class="center">{player.years.total}</Cell>
                                        {/if}
                                        <Cell class="center">{player.fpts.trans[acquisition.transType].bench.weeks} / {player.fpts.trans[acquisition.transType].total.weeks}</Cell>
                                        <Cell class="center">{round(player.fpts.trans[acquisition.transType].bench.real)}</Cell>
                                        <Cell class="center">{round(player.fpts.trans[acquisition.transType].bench.realPPG)}</Cell>
                                    </Row>
                                {/if}
                            {/each}
                        </Body>
                    </DataTable>
                {/if}
            </div>
            <div class="rankingTableWrapper">
                {#if acquisition.BenchWeek.stats && acquisition.BenchWeek.stats.length}
                    <DataTable class="rankingTable">
                        <Head>
                            <Row>
                                <Cell class="header" colspan=9>
                                    <p>
                                        Top Single-Week Benchwarmers from Players Acquired by {capitalizeFirstLetter(acquisition.transType)}<br>
                                        {prefix} – {recordPrefix} 
                                    </p>
                                </Cell>  
                            </Row>
                            <Row>
                                <Cell class="header rank"></Cell>
                                <Cell class="header rank" />
                                <Cell class="header">Player</Cell>
                                <Cell class="header">POS</Cell>
                                <Cell class="header">NFL Team</Cell>
                                <Cell class="header">Manager</Cell>
                                {#if allTime}
                                    <Cell class="header">Year</Cell>
                                {/if}
                                <Cell class="header">Week</Cell>
                                <Cell class="header">BP</Cell>
                            </Row>
                        </Head>
                        <Body>
                            {#each acquisition.BenchWeek.stats as player, ix (rand * (ix + 1))}
                                {#if rand == 0}
                                    nothing
                                {:else}
                                    <Row>
                                        <Cell class="rank">{ix + 1}</Cell>
                                        <Cell class="playerAvatar playerInfo" style="background-image: url('{player.avatar}'); vertical-align: middle; height: 45px; width: 45px; background-position: center; background-repeat: no-repeat; background-size: auto 45px;" />
                                        <Cell class="left">{player.playerInfo.fn} {player.playerInfo.ln}</Cell>
                                        <Cell class="center">
                                            <div class="pos {player.playerInfo.pos}">
                                                {player.playerInfo.pos}
                                            </div>
                                        </Cell>
                                        <Cell class="center">
                                            <img class="teamAvatar" src="https://sleepercdn.com/images/team_logos/nfl/{player.team.toLowerCase()}.png" alt="{player.team}">
                                        </Cell>
                                        <Cell class="cellName" on:click={() => gotoManager(player.recordManID)}>
                                            {player.manager.realname}
                                            {#if !allTime}
                                                <div class="fantasyTeamName">({player.manager.name})</div>
                                            {/if}
                                        </Cell>
                                        {#if allTime}
                                            <Cell class="center">{player.year}</Cell>
                                        {/if}
                                        <Cell class="center">{player.week}</Cell>
                                        <Cell class="center">{round(player.fpts)}</Cell>
                                    </Row>
                                {/if}
                            {/each}
                        </Body>
                    </DataTable>
                {/if}
            </div>
            <div class="rankingTableWrapper">
                {#if acquisition.Averages.stats && acquisition.Averages.stats.length}
                    <DataTable class="rankingTable">
                        <Head>
                            <Row>
                                <Cell class="header" colspan=5>
                                    <p>
                                        Scoring Averages with Players Acquired by {capitalizeFirstLetter(acquisition.transType)}<br>
                                        {prefix} – {recordPrefix} 
                                    </p>
                                </Cell>  
                            </Row>
                            <Row>
                                <Cell class="header rank"></Cell>
                                <Cell class="header">Manager</Cell>
                                <Cell class="header">
                                    PF Share
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.acquisitions[acquisition.transType].leagueAverages.managerAverages, playerAcqGraphs[ix].Averages.stats, 'perc', false, null, 'perc')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    PF
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.acquisitions[acquisition.transType].leagueAverages.managerAverages, playerAcqGraphs[ix].Averages.stats, 'real', false, null, 'fpts')}>filter_list</Icon>
                                </Cell>
                                <Cell class="header">
                                    PPG
                                    <Icon class="material-icons changeSort"on:click={() => changeSort(displayRecords.acquisitions[acquisition.transType].leagueAverages.managerAverages, playerAcqGraphs[ix].Averages.stats, 'realPPG', false, null, 'fptspg')}>filter_list</Icon>
                                </Cell>
                            </Row>
                        </Head>
                        <Body>
                            {#each acquisition.Averages.stats as player, ix (rand * (ix + 1))}
                                {#if rand == 0}
                                    nothing
                                {:else}
                                    <Row>
                                        <Cell class="rank">{ix + 1}</Cell>
                                        <Cell class="cellName" on:click={() => gotoManager(player.recordManID)}>
                                            {player.manager.realname}
                                            {#if !allTime}
                                                <div class="fantasyTeamName">({player.manager.name})</div>
                                            {/if}
                                        </Cell>
                                        <Cell class="center">{round(player.perc)}</Cell>
                                        <Cell class="center">{round(player.real)}</Cell>
                                        <Cell class="center">{round(player.realPPG)}</Cell>
                                    </Row>
                                {/if}
                            {/each}
                        </Body>
                    </DataTable>
                {/if}
            </div>
        {/each}
    </div>
</div>
<div class="headerRow">
    <div class="headerLabel" style="justify-content: center">{prefix} Head To Head</div>
</div>
<div class="recordsWrap">
    <div class="columnWrap" style="width: 98%;">
        <div class="headToHeadWrap">
            <div class="headToHeadChoices">
                {#each managerChoices.left as manager}
                    <div class="columnWrap" style="width: 98%; align-items: flex-start;">
                        <div class="headToHeadRow" style="{displayManagerLeft && displayManagerLeft.info.realname == manager.info.realname ? "background-color: var(--gcSelect); border: 0.1em solid var(--g111);" : null}" on:click={() => changeManager(manager.recordManID, 'left', displayYear, selection)} >{manager.info.realname}</div>
                        {#if !allTime}
                            <div class="fantasyTeamName" style="padding: 0 4%;">({manager.info.name})</div>
                        {/if}
                    </div>
                {/each}
            </div>
            <div class="columnWrap" style="width: 58%;">
                <div class="headToHeadMain">
                    <div class="columnWrap" style="border-right: 0.1em dashed var(--gcBox); border-bottom: 0.1em dashed var(--gcBox);">
                        {#if displayManagerLeft}
                            <div class="managerProfile">
                                <img class="managerAvatar" src="{displayManagerLeft.info.avatar}" alt="">
                                <div class="managerName">
                                    {displayManagerLeft.info.realname}
                                    {#if !allTime}
                                        <div class="fantasyTeamName" style="display: inline-flex; position: relative;" >({displayManagerLeft.info.name})</div>
                                    {/if}
                                </div>
                            </div>
                            <div class="headToHeadSummaryWrap">
                                <div class="columnWrap">
                                    <div class="headToHeadSummaryHeader">
                                        WINS
                                    </div>
                                    <div class="recordsWrap">
                                        <div class="columnWrap">
                                            <div class="headToHeadSummaryText">Match</div>
                                            <div class="headToHeadSummaryText" style="background-color: #7a7a7a33;">EPE</div>
                                            <div class="headToHeadSummaryText">IQ</div>
                                            <div class="headToHeadSummaryText" style="background-color: #7a7a7a33;">EPE</div>
                                            <div class="headToHeadSummaryText">BestBall</div>
                                            <div class="headToHeadSummaryText" style="background-color: #7a7a7a33;">EPE</div>
                                        </div>
                                        <div class="columnWrap">
                                            <div class="headToHeadSummaryText" style="justify-content: flex-end;">{displayManagerLeft.outcomes.match.W}</div>
                                            <div class="headToHeadSummaryText" style="background-color: #7a7a7a33; justify-content: flex-end;">{displayManagerLeft.outcomes.EPE.W}</div>
                                            <div class="headToHeadSummaryText" style="justify-content: flex-end;">{displayManagerLeft.outcomes.iq.W}</div>
                                            <div class="headToHeadSummaryText" style="background-color: #7a7a7a33; justify-content: flex-end;">{displayManagerLeft.outcomes.iqEPE.W}</div>
                                            <div class="headToHeadSummaryText" style="justify-content: flex-end;">{displayManagerLeft.outcomes.bball.W}</div>
                                            <div class="headToHeadSummaryText" style="background-color: #7a7a7a33; justify-content: flex-end;">{displayManagerLeft.outcomes.bballEPE.W}</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="columnWrap">
                                    <div class="headToHeadSummaryHeader">
                                        POINTS
                                    </div>
                                    <div class="recordsWrap">
                                        <div class="columnWrap">
                                            <div class="headToHeadSummaryText">Match</div>
                                            <div class="headToHeadSummaryText" style="background-color: #7a7a7a33;">PPG</div>
                                            <div class="headToHeadSummaryText">Proj</div>
                                            <div class="headToHeadSummaryText" style="background-color: #7a7a7a33;">PPG</div>
                                            <div class="headToHeadSummaryText">Poss</div>
                                            <div class="headToHeadSummaryText" style="background-color: #7a7a7a33;">PPG</div>
                                        </div>
                                        <div class="columnWrap">
                                            <div class="headToHeadSummaryText" style="justify-content: flex-end;">{round(displayManagerLeft.fpts.starters.real)}</div>
                                            <div class="headToHeadSummaryText" style="background-color: #7a7a7a33; justify-content: flex-end;">{round(displayManagerLeft.fpts.starters.realPPG)}</div>
                                            <div class="headToHeadSummaryText" style="justify-content: flex-end;">{round(displayManagerLeft.fpts.starters.proj)}</div>
                                            <div class="headToHeadSummaryText" style="background-color: #7a7a7a33; justify-content: flex-end;">{round(displayManagerLeft.fpts.starters.projPPG)}</div>
                                            <div class="headToHeadSummaryText" style="justify-content: flex-end;">{round(displayManagerLeft.fpts.starters.poss)}</div>
                                            <div class="headToHeadSummaryText" style="background-color: #7a7a7a33; justify-content: flex-end;">{round(displayManagerLeft.fpts.starters.possPPG)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        {/if}
                    </div>
                    <div class="columnWrap" style="border-left: 0.1em dashed var(--gcBox); border-bottom: 0.1em dashed var(--gcBox);">
                        {#if displayManagerRight}
                            <div class="managerProfile">
                                <img class="managerAvatar" src="{displayManagerRight.info.avatar}" alt="">
                                <div class="managerName">
                                    {displayManagerRight.info.realname}
                                    {#if !allTime}
                                        <div class="fantasyTeamName">({displayManagerRight.info.name})</div>
                                    {/if}
                                </div>
                            </div>
                            <div class="headToHeadSummaryWrap">
                                <div class="columnWrap">
                                    <div class="headToHeadSummaryHeader">
                                        WINS
                                    </div>
                                    <div class="recordsWrap">
                                        <div class="columnWrap">
                                            <div class="headToHeadSummaryText">Match</div>
                                            <div class="headToHeadSummaryText" style="background-color: #7a7a7a33;">EPE</div>
                                            <div class="headToHeadSummaryText">IQ</div>
                                            <div class="headToHeadSummaryText" style="background-color: #7a7a7a33;">EPE</div>
                                            <div class="headToHeadSummaryText">BestBall</div>
                                            <div class="headToHeadSummaryText" style="background-color: #7a7a7a33;">EPE</div>
                                        </div>
                                        <div class="columnWrap">
                                            <div class="headToHeadSummaryText" style="justify-content: flex-end;">{displayManagerRight.outcomes.match.W}</div>
                                            <div class="headToHeadSummaryText" style="background-color: #7a7a7a33; justify-content: flex-end;">{displayManagerRight.outcomes.EPE.W}</div>
                                            <div class="headToHeadSummaryText" style="justify-content: flex-end;">{displayManagerRight.outcomes.iq.W}</div>
                                            <div class="headToHeadSummaryText" style="background-color: #7a7a7a33; justify-content: flex-end;">{displayManagerRight.outcomes.iqEPE.W}</div>
                                            <div class="headToHeadSummaryText" style="justify-content: flex-end;">{displayManagerRight.outcomes.bball.W}</div>
                                            <div class="headToHeadSummaryText" style="background-color: #7a7a7a33; justify-content: flex-end;">{displayManagerRight.outcomes.bballEPE.W}</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="columnWrap">
                                    <div class="headToHeadSummaryHeader">
                                        POINTS
                                    </div>
                                    <div class="recordsWrap">
                                        <div class="columnWrap">
                                            <div class="headToHeadSummaryText">Match</div>
                                            <div class="headToHeadSummaryText" style="background-color: #7a7a7a33;">PPG</div>
                                            <div class="headToHeadSummaryText">Proj</div>
                                            <div class="headToHeadSummaryText" style="background-color: #7a7a7a33;">PPG</div>
                                            <div class="headToHeadSummaryText">Poss</div>
                                            <div class="headToHeadSummaryText" style="background-color: #7a7a7a33;">PPG</div>
                                        </div>
                                        <div class="columnWrap">
                                            <div class="headToHeadSummaryText" style="justify-content: flex-end;">{round(displayManagerRight.fpts.starters.real)}</div>
                                            <div class="headToHeadSummaryText" style="background-color: #7a7a7a33; justify-content: flex-end;">{round(displayManagerRight.fpts.starters.realPPG)}</div>
                                            <div class="headToHeadSummaryText" style="justify-content: flex-end;">{round(displayManagerRight.fpts.starters.proj)}</div>
                                            <div class="headToHeadSummaryText" style="background-color: #7a7a7a33; justify-content: flex-end;">{round(displayManagerRight.fpts.starters.projPPG)}</div>
                                            <div class="headToHeadSummaryText" style="justify-content: flex-end;">{round(displayManagerRight.fpts.starters.poss)}</div>
                                            <div class="headToHeadSummaryText" style="background-color: #7a7a7a33; justify-content: flex-end;">{round(displayManagerRight.fpts.starters.possPPG)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        {/if}
                    </div>
                </div>
                <div class="matchupSwitcher">
                    {#if displayManagerLeft && displayManagerRight && allMatchups.length > 0}
                        {#if selectedMatchup > 0}
                            <Icon class="material-icons changeMatchup" on:click={() => selectedMatchup = selectedMatchup - 1}>chevron_left</Icon>
                        {:else}
                            <span class="spacer" />
                        {/if}  
                        <div class="headingText">{displayMatchup.home.year} - Week {displayMatchup.home.week}</div>
                        {#if selectedMatchup < allMatchups.length - 1}
                            <Icon class="material-icons changeMatchup" on:click={() => selectedMatchup = selectedMatchup + 1}>chevron_right</Icon>
                        {:else}
                            <span class="spacer" />
                        {/if}  
                    {/if}
                </div>
                <div class="matchupWrap">
                    {#if displayManagerLeft && displayManagerRight}
                        <div class="matchupHolder" style="margin-left: -{100 * selectedMatchup}%; width: {100 * allMatchups.length}%">
                            {#each allMatchups as {home, away}}
                                <div class="matchup">
                                    <LeagueMatchup {home} {away} />
                                </div>
                            {/each}
                        </div>
                    {/if}
                </div>
            </div>
            <div class="headToHeadChoices">
                {#each managerChoices.right as manager}
                    <div class="columnWrap" style="width: 98%; align-items: flex-end;">
                        <div class="headToHeadRow" on:click={() => changeManager(manager.recordManID, 'right', displayYear, selection)} style="justify-content: flex-end; {displayManagerRight && displayManagerRight.info.realname == manager.info.realname ? "background-color: var(--gcSelect); border: 0.1em solid var(--g111);" : null}">{manager.info.realname}</div>
                        {#if !allTime}
                            <div class="fantasyTeamName" style="display: inline-flex; position: relative; justify-content: flex-end; padding: 0 4%;" >({manager.info.name})</div>
                        {/if}
                    </div>
                {/each}
            </div>
        </div>
    </div>
</div>