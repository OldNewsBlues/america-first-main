import { managers } from '$lib/utils/leagueInfo';
import { goto } from "$app/navigation";
import { stringDate } from './news';

export const cleanName = (name) => {
    return name.replace('Team ', '').toLowerCase().replace(/[ ’'!"#$%&\\'()\*+,\-\.\/:;<=>?@\[\\\]\^_`{|}~']/g, "");
}

export const round = (num) => {
    return (Math.round((num + Number.EPSILON) * 100) / 100).toFixed(2);
}

export const min = (stats, roundOverride) => {
    const num = Math.min(...stats)
    return Math.floor(num / roundOverride) * roundOverride;
}

export const max = (stats, roundOverride) => {
    const num = Math.max(...stats)
    return Math.ceil(num / roundOverride) * roundOverride;
}

export const gotoManager = (recordManID) => {
    if(!managers.length) return;
    const managersIndex = managers.findIndex(m => m.managerID == recordManID);
    // if no manager exists for that roster, -1 will take you to the main managers page
    goto(`/managers?manager=${managersIndex}`);
}

export const getAuthor = (rosters, users, author) => {
    let user = null;
    for(const userKey of Object.keys(users)) {
        if(users[userKey].display_name.toLowerCase() == author.toLowerCase()) {
            user = users[userKey];
            break;
        }
    }
    if(!user) return author;

    const userID = user.user_id;
    const roster = rosters.find(r => r.owner_id == userID || (r.co_owners && r.co_owners.indexOf(userID) > -1));
    return `<a href="/managers?manager=${managers.findIndex(m => m.roster == roster.roster_id)}">${user.metadata.team_name ? user.metadata.team_name : user.display_name}</a>`;
}

export const getAvatar = (users, author) => {
    let user = null;
    let userAvatar;
    for(const userKey of Object.keys(users)) {
        if(users[userKey].display_name.toLowerCase() == author.toLowerCase()) {
            user = users[userKey];
            break;
        }
    }
    if(!user) return 'managers/question.jpg';

    if(user.avatar != null) {
        userAvatar = `https://sleepercdn.com/avatars/thumbs/${user.avatar}`;
    } else {
        userAvatar = `https://sleepercdn.com/images/v2/icons/player_default.webp`;
    }

    return userAvatar;
}

export const parseDate = (rawDate) => {
    const ts = Date.parse(rawDate);
    const d = new Date(ts);
    return stringDate(d);
}

export const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export const generateGraph = ({stats, secondStats = null, x, y, stat, statCat, secondStatCat = null, header, field, short, secondField = null, classes = null, path = null, pathKey = null, pathKey2 = null, negative = null}, roundOverride = 10, yMinOverride = null) => {
    if(!stats) return null;

    const graph = {
        stats: [],
        secondStats: [],
        managers: [],
        recordManIDs: [],
        labels: {x, y, stat},
        statCat,
        secondStatCat,
        field,
        secondField,
        header,
        yMin: 0,
        yMax: 0,
        short,
        classes,
        path,
        pathKey,
        pathKey2,
        negative,
    }

    const sortedStats = [...stats].sort((a, b) => a.recordManID - b.recordManID);

    for(let indivStat of sortedStats) {
        let trueStat = indivStat;
        
        if(path && path.length > 0) {
            for(let i = 0; i < path.length; i++) {
                trueStat = trueStat[path[i]];
            }
        }
        
        const pushStat = negative ? -1 * Math.round(trueStat[field]) : Math.round(trueStat[field]);
        graph.stats.push(pushStat);
        graph.managers.push(indivStat.manager);
        graph.recordManIDs.push(indivStat.recordManID)
    }

    if(secondField) {
        const sortedSecondStats = [...secondStats].sort((a, b) => a.recordManID - b.recordManID);

        for(const indivSecondStat of sortedSecondStats) {
            let trueStat = indivSecondStat;
            if(path && path.length > 0) {
                for(let i = 0; i < path.length; i++) {
                    trueStat = trueStat[path[i]];
                }
            }
            const pushStat = negative ? -1 * Math.round(trueStat[secondField]) : Math.round(trueStat[secondField]);
            graph.secondStats.push(pushStat);
        }
    }

    if(classes) {
        graph.classes = [];

        for(const statClass of classes) {
            graph.classes.push({
                keys: [],
                stats: [],
                percs: [],
                heights: [],
                short: statClass.short,
                colors: statClass?.colors || null,
                yMax: 0,
            });

            if(!statClass.field) continue;

            const totals = {};
            const totalsArray = [];
            const statsEntry = {};
            const percsEntry = {};
            const heightsEntry = {};

            let goBetween = [];
           
            const graphClass = graph.classes.find(c => c.short == statClass.short);

            for(const key of statClass.keys) {
                graphClass.keys.push(key);
                
                for(let indivStat of sortedStats) {
                    let totalStat = indivStat;
                    let trueStat = indivStat;
                    for(let i = 0; i < statClass.path.length; i++) {
                        trueStat = statClass.path[i] == 'key' ? trueStat[key] : trueStat[statClass.path[i]];
                    }
                    for(let i = 0; i < statClass.totalPath.length; i++) {
                        totalStat = statClass.path[i] == 'key' ? totalStat[key] : totalStat[statClass.totalPath[i]];
                    }

                    if(!statsEntry[indivStat.recordManID]) statsEntry[indivStat.recordManID] = [];
                    if(!percsEntry[indivStat.recordManID]) percsEntry[indivStat.recordManID] = [];

                    totalsArray.push(totalStat[statClass.totalField]);
                    totals[indivStat.recordManID] = totalStat[statClass.totalField];
                    statsEntry[indivStat.recordManID].push(Math.round(trueStat[statClass.field]));
                    percsEntry[indivStat.recordManID].push(trueStat.perc);
                }
            }

            graphClass.yMax = Math.round(totalsArray.sort((a, b) => b - a)[0]); 
            const actualMax = totalsArray.sort((a, b) => b - a)[0];

            for(const recordManID in percsEntry) {

                heightsEntry[recordManID] = [];
                let runningHeight = 0;

                for(let i = 0; i < percsEntry[recordManID].length; i++) {
                    
                    const adjustedPerc = percsEntry[recordManID][i] * totals[recordManID] / actualMax;
                    runningHeight += adjustedPerc;
                    heightsEntry[recordManID].push(100 * runningHeight);
                    percsEntry[recordManID][i] = Math.round(100 * percsEntry[recordManID][i]);
                }

                goBetween.push({
                    recordManID,
                    stats: statsEntry[recordManID],
                    percs: percsEntry[recordManID],
                    heights: heightsEntry[recordManID],
                    total: totals[recordManID],
                })
            }

            goBetween = goBetween.sort((a, b) => a.recordManID - b.recordManID);
            for(const entry of goBetween) {
                graphClass.stats.push(entry.stats);
                graphClass.percs.push(entry.percs);
                graphClass.heights.push(entry.heights);
            }
            
        }
    }

    graph.yMax = max(graph.stats, roundOverride);
    graph.yMin = min(graph.stats, roundOverride);
    if(secondField) graph.yMin = min(graph.secondStats, roundOverride);
    if(yMinOverride) graph.yMin = yMinOverride;

    return graph;
}