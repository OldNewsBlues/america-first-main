<script>
    import { getPlayByPlay, getGameStats, getPlayerStats, waitForAll, round, getGameDrives, getStarterPositions, LZString } from '$lib/utils/helper'; 
    // import filmData from '/Users/jessekovacs/Downloads/Film Data Processed - JSON.json';
    // import filmJson from '/Users/jessekovacs/Downloads/Film Data Processed - JSON (2).json';
    import LinearProgress from '@smui/linear-progress';

    export let newLoading, nflTeams, nflMatchups, yearLeagueData, fantasyStarters, managerInfo, weekMatchups, playersInfo, nflPlayerInfo, gameSelection, matchSelection, managerSelection, fantasyProducts, viewPlayerID, showGameBox, showMatchBox, leaderBoardInfo, weekSelection, yearSelection;

    let idpEnabled = false;
    let kickerEnabled = true;
    let defenseEnabled = true;
    let startersArray = [];
    let allNflPlayerInfo = [];
    let allPlayersInfo = [];
    for(const key in nflPlayerInfo) {
        allNflPlayerInfo.push(nflPlayerInfo[key]);
    }
    for(const key in playersInfo.players) {
        allPlayersInfo.push(playersInfo.players[key]);
    }

    // const espnScoringIDs = {        // currently only used for reference while coding - 
    //     2: 'end period',               these specific IDs make it easier to isolate 
    //     3: 'incomplete pass',          which stats are earning fpts
    //     5: 'rush',
    //     7: 'sack',
    //     8: 'penalty',
    //     9: 'fumble offense recovery',
    //     12: 'kickoff (return)',
    //     15: '2pt pass conversion',
    //     16: '2pt rush conversion',
    //     17: 'blocked punt',
    //     18: 'blocked field goal',
    //     20: 'safety',
    //     21: 'timeout',
    //     24: 'completed pass',
    //     26: 'interception (return)',
    //     29: 'fumble turnover'
    //     32: 'kick six'
    //     36: 'pick six',
    //     37: 'blocked punt td',
    //     39: 'fumble six',
    //     43: 'blocked PAT',
    //     52: 'punt',
    //     53: 'kickoff (no return)',
    //     57: 'defensive 2pt conversion',
    //     59: 'FG good',
    //     60: 'FG miss',
    //     61: 'PAT good',
    //     62: 'PAT missed',
    //     65: 'half-time',
    //     66: 'end game',
    //     67: 'pass TD', 
    //     68: 'rush TD',
    //     70: 'coin toss',
    //     74: 'official timeout',
    //     75: '2-min warning',
    // }

    // descriptions for stat totals displayed in viewPlayer box 
    const statDescriptions = {
        pts_allow: 'PTS ALW:',
        pts_allow_0: 'PTS ALW:',
        pts_allow_1_6: 'PTS ALW:',
        pts_allow_7_13: 'PTS ALW:',
        pts_allow_14_20: 'PTS ALW:',
        pts_allow_21_27: 'PTS ALW:',
        pts_allow_28_34: 'PTS ALW:',
        pts_allow_35p: 'PTS ALW:',
        yds_allow: 'YDS ALW:',
        yds_allow_0_100: 'YDS ALW:',
        yds_allow_100_199: 'YDS ALW:',
        yds_allow_200_299: 'YDS ALW:',
        yds_allow_300_349: 'YDS ALW:',
        yds_allow_350_399: 'YDS ALW:',
        yds_allow_400_449: 'YDS ALW:',
        yds_allow_450_499: 'YDS ALW:',
        yds_allow_500_549: 'YDS ALW:',
        yds_allow_550p: 'YDS ALW:',
        sack: 'SACK:',
        sack_yd: 'SACK YDS:',
        qb_hit: 'QB HIT:',
        tkl: 'TKL:',
        tkl_loss: 'TKL LOSS:',
        tkl_ast: 'TKL AST:',
        tkl_solo: 'TKL SOLO:',
        def_td: 'TD (D):',
        def_st_td: 'TD (ST)',
        def_st_fum_rec: 'FUMB REC (ST):',
        def_st_tkl_solo: 'TKL SOLO (ST):',
        def_pass_def: 'PASS DEF:',
        st_fum_rec: 'FUMB REC (ST PLAYER):',
        st_td: 'TD (ST PLAYER):',
        st_ff: 'FRCD FUMB (ST PLAYER):',
        st_tkl_solo: 'TKL SOLO (ST PLAYER):',
        fum_rec: 'FUMB REC (D):',
        fum_rec_td: 'FUMB TD:',
        fum_ret_yd: 'FUMB REC YDS:',
        def_st_ff: 'FRCD FUMB (ST):',
        ff: 'FRCD FUMB (D):',
        int: 'INT:',
        int_ret_yd: 'INT RET YDS:',
        def_kr_yd: 'KR YDS:',
        kr_yd: 'KR YDS:',
        pr_yd: 'PR YDS:',
        def_pr_yd: 'PR YDS:',
        def_forced_punts: 'FRCD PUNT:',
        fg_ret_yd: 'FG RET YDS:',
        pass_2pt: '2-PT PASS:',
        rush_2pt: '2-PT RUSH:',
        rec_2pt: '2-PT REC:',
        def_2pt: 'DEF 2-PT',
        fum: 'FUMB:',
        fum_lost: 'FUMB TO:',
        def_3_and_out: '3 & OUT:',
        def_4_and_stop: 'TO ON DOWNS:',
        blk_kick: 'BLK KICK',
        blk_kick_ret_yd: 'BLK KICK RET YDS:',
        bonus_pass_yd_400: 'BONUS 400+ PASS YDS',
        bonus_pass_yd_300: 'BONUS 300+ PASS YDS',
        bonus_pass_cmp_25: 'BONUS 25+ CMP:',
        pass_int: 'INT:',
        pass_int_td: 'PICK 6:',
        pass_sack: 'SACKED:',
        pass_att: 'PASS ATT:',
        pass_cmp: 'PASS CMP:',
        pass_inc: 'PASS INC:',
        pass_fd: 'PASS 1ST DOWN:',
        rush_fd: 'RUSH 1ST DOWN:',
        rec_fd: 'REC 1ST DOWN:',
        idp_int: 'INT:',
        idp_int_ret_yd: 'INT RET YDS:',
        idp_tkl: 'TKL:',
        idp_tkl_ast: 'TKL AST:',
        idp_tkl_solo: 'TKL SOLO:',
        idp_tkl_loss: 'TKL LOSS:',
        idp_def_td: 'TD:',
        idp_pass_def: 'PASS DEF:',
        idp_pass_def_3p: 'BONUS 3+ PASS DEF:',
        idp_fum_rec: 'FUMB REC:',
        idp_fum_ret_yd: 'FUMB REC YDS:',
        idp_ff: 'FRCD FUMB:',
        idp_qb_hit: 'QB HIT:',
        idp_sack: 'SACK:',
        idp_sack_yd: 'SACK YDS:',
        idp_blk_kick: 'BLK KICK',
        bonus_tkl_10p: 'BONUS 10+ TKL:',
        bonus_sack_2p: 'BONUS 2+ SACK:',
        safe: 'SAFETY:',
        idp_safe: 'SAFETY:',
        rush_td: 'TD (RUSH):',
        pass_td: 'TD (PASS):',
        pass_td_40p: 'BONUS 40+ PASS TD:',
        pass_td_50p: 'BONUS 50+ PASS TD:',
        pass_cmp_40p: 'BONUS 40+ PASS CMP:',
        rec_td: 'TD (REC):',
        bonus_rec_rb: 'BONUS RB REC:',
        bonus_rec_te: 'BONUS TE REC:',
        bonus_rec_wr: 'BONUS WR REC:',
        rec: 'REC:',
        rush_yd: 'RUSH YDS:',
        rec_yd: 'REC YDS:',
        pass_yd: 'PASS YDS:',
        rec_0_4: 'REC:',
        rec_5_9: 'REC:',
        rec_10_19: 'REC:',
        rec_20_29: 'REC:',
        rec_30_39: 'REC:',
        rec_40p: 'REC:',
        rush_40p: 'BONUS 40+ RUSH:',
        bonus_rec_yd_100: 'BONUS 100+ REC YDS:',
        bonus_rush_rec_yd_100: 'BONUS 100+ RUSH/REC YDS:',
        bonus_rush_rec_yd_200: 'BONUS 200+ RUSH/REC YDS:',
        bonus_rush_yd_100: 'BONUS 100+ RUSH YDS:',
        bonus_rush_yd_200: 'BONUS 200+ RUSH YDS:',
        rush_td_40p: 'BONUS 40+ RUSH TD:',
        rush_td_50: 'BONUS 50+ RUSH TD:',
        rec_td_40p: 'BONUS 40+ REC TD:',
        rec_td_50p: 'BONUS 50+ REC TD:',
        bonus_rush_att_20: 'BONUS 20+ CARRIES:',
        bonus_def_fum_td_50p: 'BONUS 50+ FUMB REC TD:',
        bonus_def_int_td_50p: 'BONUS 50+ PICK 6:',
        rush_att: 'CARRY',
        fgm: 'FG:',
        fgm_yds: 'FG YDS:',
        fgmiss: 'FG MISS:',
        fgm_0_19: 'FG (0-19):',
        fgm_20_29: 'FG (20-29):',
        fgm_30_39: 'FG (30-39):',
        fgm_40_49: 'FG (40-49):',
        fgm_50p: 'FG (50+):',
        fgm_yds_over_30: 'FG (30+):',
        fgmiss_0_19: 'FG MISS (0-19):',
        fgmiss_20_29: 'FG MISS (20-29):',
        fgmiss_30_39: 'FG MISS (30-39):',
        fgmiss_40_49: 'FG MISS (40-49):',
        fgmiss_50p: 'FG MISS (50+):',
        xpm: 'PAT:',
        xpmiss: 'PAT MISS:',
    }

    const loadPlayByPlay = async (gameSelection, matchSelection, startersArray, showGameBox, showMatchBox) => {

        
        let fantasyProducts = [];
        const score = yearLeagueData.scoring_settings;
        const positions = getStarterPositions(yearLeagueData);
        if(positions.includes('IDP_FLEX') || positions.includes('DB') || positions.includes('LB') || positions.includes('DL')) idpEnabled = true;
        if(!positions.includes('K')) kickerEnabled = false;
        if(!positions.includes('DEF')) defenseEnabled = false;

        // extracts Espn Team ID from API link
        const parseEspnTeamID = (teamLink, linkType, weekSelection, yearSelection) => {
            let espnID;
            if(linkType == 'play') {
                if(teamLink.slice(82, 84)[1] != '?') {
                    espnID = teamLink.slice(82, 84);
                } else {
                    espnID = teamLink.slice(82, 83);
                }
            } else if(linkType == 'player') {
                espnID = teamLink.slice(85, teamLink.indexOf('?'));
            } else if(linkType == 'participants') {
                let espnPlayerID = teamLink.slice(85, teamLink.indexOf('?'));
                if(allNflPlayerInfo.find(n => n.espn.id == espnPlayerID) && allNflPlayerInfo.find(n => n.espn.id == espnPlayerID).espn.t[yearSelection].length > 1 && allNflPlayerInfo.find(n => n.espn.id == espnPlayerID).espn.t[yearSelection].find(w => w.firstWeek <= weekSelection && w.lastWeek >= weekSelection)) {
                    espnID = nflTeams.find(t => t.espnAbbreviation == allNflPlayerInfo.find(n => n.espn.id == espnPlayerID).espn.t[yearSelection].find(w => w.firstWeek <= weekSelection && w.lastWeek >= weekSelection).team).espnAbbreviation;
                } else if(allPlayersInfo.find(n => n.espnID == espnPlayerID) && allPlayersInfo.find(n => n.espnID == espnPlayerID).wi[yearSelection] && allPlayersInfo.find(n => n.espnID == espnPlayerID).wi[yearSelection][weekSelection]?.t) {
                    espnID = nflTeams.find(t => t.sleeperID == allPlayersInfo.find(n => n.espnID == espnPlayerID).wi[yearSelection][weekSelection].t).espnAbbreviation;
                } else if(allPlayersInfo.find(n => n.espnID == espnPlayerID) && allPlayersInfo.find(n => n.espnID == espnPlayerID).wi[yearSelection] && allPlayersInfo.find(n => n.espnID == espnPlayerID).wi[yearSelection][1]?.t) {
                    espnID = nflTeams.find(t => t.sleeperID == allPlayersInfo.find(n => n.espnID == espnPlayerID).wi[yearSelection][1].t).espnAbbreviation;
                } else {
                    espnID = nflTeams.find(t => t.espnAbbreviation == allNflPlayerInfo.find(n => n.espn.id == espnPlayerID).espn.t[yearSelection][0]).espnAbbreviation;
                }
            }
            return espnID;
        }

        // determines whether play counts w.r.t. yards, penalties, etc.
        const checkNoPlay = (playType, playDescription) => {
            let noPlay = false;
            if(playType == 8 || playDescription.includes('No Play.') || playType == 2 || playType == 21 || playType == 65 || playType == 66 || playType == 70 || playType == 74 || playType == 75) {
                noPlay = true;
            } else {
                noPlay = false;
            }
            return noPlay;
        }

        // flags injuries to starters
        const checkInjury = (playDescription, relevantStartersArray) => {
            let injuredPlayer;
            if(!playDescription.includes('were injured')) {
                injuredPlayer = playDescription.slice(0, playDescription.indexOf(' was injured'))
                injuredPlayer = injuredPlayer.split('');
                injuredPlayer = injuredPlayer.reverse();
                injuredPlayer = injuredPlayer.join('');

                let injuryTeam = injuredPlayer.slice(0, injuredPlayer.indexOf('-') + 4);
                injuredPlayer = injuredPlayer.slice(0, injuredPlayer.indexOf('-'));

                injuryTeam = injuryTeam.split('');
                injuryTeam = injuryTeam.reverse();
                injuryTeam = injuryTeam.join('');
                if(injuryTeam[0] == ' ') {
                    injuryTeam = injuryTeam.slice(1, injuryTeam.indexOf('-'));
                } else {
                    injuryTeam = injuryTeam.slice(0, injuryTeam.indexOf('-'));
                }

                injuredPlayer = injuredPlayer.split('');
                injuredPlayer = injuredPlayer.reverse();
                injuredPlayer = injuredPlayer.join('');
                let firstInitial = injuredPlayer[0];
                let surname = injuredPlayer.slice(injuredPlayer.indexOf('.') + 1);

                if(relevantStartersArray.find(s => s.ln == surname && s.t == injuryTeam && s.fn.slice(0, 1) == firstInitial)) {
                    injuredPlayer = relevantStartersArray.find(s => s.ln == surname && s.t == injuryTeam && s.fn.slice(0, 1) == firstInitial);
                } else {
                    injuredPlayer = null;
                }
            }
            return injuredPlayer;
        }   

        // checks whether play is relevant to Team DEF/ST scoring
        const isDefRelevant = (play, playType, playTeam, homeDefStarted, awayDefStarted, home, away, homeDefense, awayDefense, playerKey, playerTeam) => {
            let relevantEntry;
            if(playType == 7 || playType == 9 || playType == 26 ||     
                playType == 36 || playType == 52 || playType == 12 ||   
                playType == 32 || playType == 17 || playType == 29 ||
                playType == 37 || playType == 39 || playType == 18 ||
                playType == 20 || playType == 57 || play.pointAfterType == 0 || play.pointAfterType == 43 ||
                (playType == 60 && play.alternativeText.includes('BLOCKED'))) {    

                if(awayDefStarted == true && ((playTeam == home && playerTeam == away) || (playType == 52 && play.alternativeText.includes('MUFFS') && playTeam == away && playerTeam == away))) {
                    relevantEntry = {
                        playerInfo: awayDefense,
                        manager: awayDefense.owner,
                        statType: play.participants[playerKey].type,
                        yards: play.statYardage, 
                        playType: playType,
                        oppDef: away,
                    }
                } else if(homeDefStarted == true && ((playTeam == away && playerTeam == home) || (playType == 52 && play.alternativeText.includes('MUFFS') && playTeam == home && playerTeam == home))) {
                    relevantEntry = {
                        playerInfo: homeDefense,
                        manager: homeDefense.owner,
                        statType: play.participants[playerKey].type,
                        yards: play.statYardage, 
                        playType: playType,
                        oppDef: home,
                    }
                }
            } 
            return relevantEntry;
        }
        // games with laterals: Lions-Steelers (2021-10), Bills-Jets (2021-10), Colts-Jets (2021-9), Dolphins-Texans (2021-9)
        // determines true stat yardage on plays involving laterals - TO-DO: much stupid work to process "circus plays" ; also other types of plays besides pass
        const processLateral = (play, player, relevantStartersArray) => {
            const lateralInfo = [];

            if(player.playType == 24 || play.secondDescription.includes('Pass for')) {
                let lateralCount = 1;

                let moreLaterals = true;
                let countCheck = play.description.slice(play.description.indexOf('Lateral') + 7);
                while(moreLaterals == true) {
                    if(countCheck.includes('Lateral')) {
                        lateralCount++;
                        countCheck = countCheck.slice(play.description.indexOf('Lateral') + 7);
                    } else {
                        moreLaterals = false;
                    }
                }


                let firstPlayerIndex = play.description.indexOf('.', play.description.indexOf('.') + 1);
                let firstPlayer = play.description.slice(firstPlayerIndex - 2, play.description.indexOf('. '));
                let firstPlayerInitial;
                if(firstPlayer[0] == ' ') { 
                    firstPlayerInitial = firstPlayer.slice(1, 2);
                } else {
                    firstPlayerInitial = firstPlayer.slice(0, 1);
                }
                let firstPlayerSurname = firstPlayer.slice(firstPlayer.indexOf('.') + 1, firstPlayer.indexOf('to') - 1);
                let firstPlayerYards = parseInt(play.description.slice(play.description.indexOf('yards') - 3, play.description.indexOf('yards') - 1));

                let lateralPlayerArray = [];
                let lateralPlayer = play.description.slice();
                while(lateralCount > 0) {
                    lateralPlayer = lateralPlayer.slice(lateralPlayer.indexOf('Lateral') + 11);

                    let lateralPlayerInitial = lateralPlayer.slice(0, 1);
                    let lateralPlayerSurname = lateralPlayer.slice(lateralPlayer.indexOf('.') + 1, lateralPlayer.indexOf(' '));
                    let lateralPlayerYards = parseInt(lateralPlayer.slice(lateralPlayer.indexOf(' yards') - 2, lateralPlayer.indexOf(' yards')));
 
                    lateralPlayerArray.push({
                        initial: lateralPlayerInitial,
                        surname: lateralPlayerSurname,
                        yards: lateralPlayerYards,
                    });
                    lateralCount--;
                }

                let totalLateralYards = 0;
                for(const player in lateralPlayerArray) {
                    totalLateralYards += lateralPlayerArray[player].yards;
                }
                
                let lastPlayerYards = lateralPlayerArray[0].yards;
                if(lateralCount == 1) {
                    if(firstPlayerYards < 0 && player.yards > 0) {
                        firstPlayerYards = 0;
                        lastPlayerYards = player.yards;
                    } else if((firstPlayerYards < 0 && player.yards <= 0) || (firstPlayerYards > 0 && lastPlayerYards == 0 && firstPlayerYards > player.yards)) {
                        firstPlayerYards = player.yards;
                        lastPlayerYards = 0;
                    } else if(firstPlayerYards > 0 && firstPlayerYards > player.yards && lateralPlayerYards > 0) {
                        firstPlayerYards = firstPlayerYards - lastPlayerYards;
                    } else if(firstPlayerYards > 0 && firstPlayerYards > player.yards && lastPlayerYards < 0) {
                        firstPlayerYards = player.yards - lastPlayerYards;
                    } else if(firstPlayerYards > 0 && firstPlayerYards < player.yards && (player.yards - lastPlayerYards < 0)) {
                        firstPlayerYards += player.yards - lastPlayerYards;
                    }
                } else {
                    // calculate firstPlayer's yards first
                    if(firstPlayerYards < 0 && player.yards > 0) {
                        firstPlayerYards = 0;
                    } else if((firstPlayerYards < 0 && player.yards <= 0) || (firstPlayerYards > 0 && totalLateralYards == 0 && firstPlayerYards > player.yards)) {
                        firstPlayerYards = player.yards;
                    } else if(firstPlayerYards > 0 && firstPlayerYards > player.yards && totalLateralYards > 0) {
                        firstPlayerYards = firstPlayerYards - totalLateralYards;
                    } else if(firstPlayerYards > 0 && firstPlayerYards > player.yards && totalLateralYards < 0) {
                        firstPlayerYards = player.yards - totalLateralYards;
                    } else if(firstPlayerYards > 0 && firstPlayerYards < player.yards && (player.yards - totalLateralYards < 0)) {
                        firstPlayerYards += player.yards - totalLateralYards;
                    }

                    // now each lateralee (super hacky & assumes ball gets past line of scrimmage after 3 laterals)
                    // if(firstPlayerYards < 0 && lateralPlayerArray[0].yards + firstPlayerYards <= 0) {
                    //     lateralPlayerArray[0].yards = 0;
                    //     if(lateralPlayerArray[0].yards + firstPlayerYards + lateralPlayerArray[1].yards <= 0) {
                    //         lateralPlayerArray[1].yards = 0
                    //         if(lateralPlayerArray[2] && (lateralPlayerArray[0].yards + firstPlayerYards + lateralPlayerArray[1].yards + lateralPlayerArray[2].yards <= 0)) {
                    //             lateralPlayerArray[2].yards = 0;
                    //         } else if(lateralPlayerArray[2]) {
                    //             lateralPlayerArray[2].yards += firstPlayerYards
                    //             let priorYards = firstPlayerYards;
                    //             let priorLaterals = lateralPlayerArray.slice();
                    //             while(priorYards < 0) {
                    //                 priorYards += priorLaterals[0].yards;
                    //                 if(priorYards > 0) {
                    //                     lateralPlayerArray[2].yards += priorLaterals[0].yards - priorYards;
                    //                 }
                    //                 priorLaterals = priorLaterals.shift()
                    //             }

                    //             if(firstPlayerYards + lateralPlayerArray[0].yards < 0) {
                    //                 lateralPlayerArray[2].yards += firstPlayerYards + lateralPlayerArray[i].yards;
                    //             }
                    //         }
                    //     }
                    // } 
                }

                if(relevantStartersArray.find(s => s.ln == firstPlayerSurname && s.t == play.playTeam && s.fn.slice(1) == firstPlayerInitial)) {
                    firstPlayer = relevantStartersArray.find(s => s.ln == firstPlayerSurname && s.t == play.playTeam && s.fn.slice(1) == firstPlayerInitial);
                    lateralInfo.push({
                        player: firstPlayer,
                        yards: firstPlayerYards,
                        stats: ['rec', 'rec_yd'],
                    });
                }

                if(lateralCount > 1) {
                    for(let i = 0; i < lateralPlayerArray.length - 1; i++) {
                        if(relevantStartersArray.find(s => s.ln == lateralPlayerArray[i].surname && s.t == play.playTeam && s.fn.slice(1) == lateralPlayerArray[i].initial)) {
                            let lateralPlayer = relevantStartersArray.find(s => s.ln == lateralPlayerArray[i].surname && s.t == play.playTeam && s.fn.slice(1) == lateralPlayerArray[i].initial);
                            lateralInfo.push({
                                player: lateralPlayer,
                                yards: lateralPlayerArray[i].yards,
                                stats: ['rec_yd'],
                            });
                        }
                    }
                }
                
                lateralInfo.push({
                    player: player,
                    yards: lastPlayerYards,
                    stats: ['rec_yd'],
                });
            }
            return lateralInfo;
        }
        // determines yardage on fumble plays
        const processFumble = (play, player) => {
            // TO-DO Bengals-Bronces 2021-15 for fumble on a fumble return
            let fumbleInfo;
            let finalDescription = play.description;
            if(finalDescription.includes('REVERSED')) {
                finalDescription = finalDescription.slice(finalDescription.indexOf('REVERSED'));
            }

            if(finalDescription.includes('FUMBLES') || finalDescription.includes('MUFFS')) {

                fumbleInfo = {
                    initialYards: null,
                    initialSpot: null,
                    recoverySpot: null,
                    ballMoved: null,
                    statYards: [],
                    oppYards: [],
                    turnover: false,
                }

                let statEntry = {
                    player,
                    yards: 0,
                    recovery: false,
                }

                let fumbleText = [];
            
                let firstFumble = finalDescription.includes('MUFFS') ? finalDescription.slice() : finalDescription.slice(finalDescription.indexOf('FUMBLES'));
                let secondFumble = finalDescription.includes('MUFFS') ? finalDescription.slice() : finalDescription.slice(finalDescription.indexOf('FUMBLES') + 7);
                // current logic maxes out at 3 fumbles
                if(secondFumble.includes('FUMBLES')) {
                    let index = firstFumble.indexOf('FUMBLES', firstFumble.indexOf('FUMBLES') + 1);
                    secondFumble = firstFumble.slice(index);
                    firstFumble = firstFumble.slice(0, index);
                    fumbleText.push(firstFumble);

                    let thirdFumble = secondFumble.slice(secondFumble.indexOf('FUMBLES') + 7);
                    if(thirdFumble.includes('FUMBLES')) {
                        let secondIndex = secondFumble.indexOf('FUMBLES', secondFumble.indexOf('FUMBLES') + 1);
                        thirdFumble = secondFumble.slice(secondIndex);
                        secondFumble = secondFumble.slice(0, secondIndex);
                        fumbleText.push(secondFumble);
                        fumbleText.push(thirdFumble);
                    } else {
                        fumbleText.push(secondFumble);
                    }
                } else {
                    fumbleText.push(firstFumble);
                }

                if(play.playType != 9 && (play.playType == 29 || fumbleText[fumbleText.length - 1].includes(`RECOVERED by ${play.oppTeam}`) || (play.playType == 52 && finalDescription.includes('MUFFS') && finalDescription.includes(`RECOVERED by ${play.team}`) && !finalDescription.includes(`RECOVERED by ${play.oppTeam}`)))) {
                    fumbleInfo.turnover = true;
                }

                // STRIP-SACKS
                if(play.playType == 7 || play.secondDescription.includes('Sacked')) {

                    fumbleInfo.initialSpot = finalDescription.slice(finalDescription.indexOf(' at ' ) + 4, finalDescription.indexOf(' at ' ) + 10);
                    if(fumbleInfo.initialSpot[5] == ' ') {
                        fumbleInfo.initialSpot = fumbleInfo.initialSpot.slice(0, 5);
                    } else if(fumbleInfo.initialSpot[5] == 'f') {
                        fumbleInfo.initialSpot = fumbleInfo.initialSpot.slice(0, 4);
                    }

                    fumbleInfo.initialYards = finalDescription.slice(finalDescription.indexOf(' for ') + 5, finalDescription.indexOf(' for ') + 8);
                    if(fumbleInfo.initialYards[2] == ' ') {
                        fumbleInfo.initialYards = fumbleInfo.initialYards.slice(0, 2);
                    } else if(fumbleInfo.initialYards[2] == 'y') {
                        fumbleInfo.initialYards = fumbleInfo.initialYards.slice(0, 1);
                    }
                    fumbleInfo.initialYards = parseInt(fumbleInfo.initialYards);

                    if(play.secondDescription.includes('Yrd Loss')) {
                        fumbleInfo.ballMoved = play.secondDescription.slice(play.secondDescription.indexOf(' Yrd Loss') - 2, play.secondDescription.indexOf(' Yrd Loss'))
                        if(fumbleInfo.ballMoved[0] == ' ') {
                            fumbleInfo.ballMoved = fumbleInfo.ballMoved.slice(1);
                        }
                        fumbleInfo.ballMoved = parseInt(fumbleInfo.ballMoved)
                        if(fumbleInfo.ballMoved != 0) {
                            fumbleInfo.ballMoved = fumbleInfo.ballMoved * (-1);
                        }
                    }  

                    statEntry.yards = fumbleInfo.initialYards;
                    fumbleInfo.statYards.push(statEntry);
                }

                // RUSHING PLAYS
                if((play.playType == 5 || play.playType == 9) && (play.secondDescription.includes('Yard Rush') || play.secondDescription.includes('Yrd Rush') || play.secondDescription.includes('Loss of'))) {

                    fumbleInfo.initialSpot = finalDescription.slice(finalDescription.indexOf(' to ' ) + 4, finalDescription.indexOf(' to ' ) + 10);
                    if(fumbleInfo.initialSpot[5] == ' ') {
                        fumbleInfo.initialSpot = fumbleInfo.initialSpot.slice(0, 5);
                    } else if(fumbleInfo.initialSpot[5] == 'f') {
                        fumbleInfo.initialSpot = fumbleInfo.initialSpot.slice(0, 4);
                    }

                    fumbleInfo.initialYards = finalDescription.slice(finalDescription.indexOf(' for ') + 5, finalDescription.indexOf(' for ') + 8);
                    if(fumbleInfo.initialYards[2] == ' ') {
                        fumbleInfo.initialYards = fumbleInfo.initialYards.slice(0, 2);
                    } else if(fumbleInfo.initialYards[2] == 'y') {
                        fumbleInfo.initialYards = fumbleInfo.initialYards.slice(0, 1);
                    }
                    fumbleInfo.initialYards = parseInt(fumbleInfo.initialYards);

                    if(play.secondDescription.includes('Yard Rush')) {
                        fumbleInfo.ballMoved = play.secondDescription.slice(play.secondDescription.indexOf(' Yard Rush') - 2, play.secondDescription.indexOf(' Yard Rush'))
                        if(fumbleInfo.ballMoved[0] == ' ') {
                            fumbleInfo.ballMoved = fumbleInfo.ballMoved.slice(1);
                        }
                        fumbleInfo.ballMoved = parseInt(fumbleInfo.ballMoved);
                    } else if(play.secondDescription.includes('Yrd Rush')) {
                        fumbleInfo.ballMoved = play.secondDescription.slice(play.secondDescription.indexOf(' Yrd Rush') - 2, play.secondDescription.indexOf(' Yrd Rush'))
                        if(fumbleInfo.ballMoved[0] == ' ') {
                            fumbleInfo.ballMoved = fumbleInfo.ballMoved.slice(1);
                        }
                        fumbleInfo.ballMoved = parseInt(fumbleInfo.ballMoved);
                    } else if(play.secondDescription.includes('Loss of')) {
                        fumbleInfo.ballMoved = play.secondDescription.slice(play.secondDescription.indexOf('Loss of') + 8, play.secondDescription.indexOf('Loss of') + 10);
                        if(fumbleInfo.ballMoved[1] == ' ') {
                            fumbleInfo.ballMoved = fumbleInfo.ballMoved.slice(0, 1);
                        }
                        fumbleInfo.ballMoved = parseInt(fumbleInfo.ballMoved) * (-1);
                    }

                    fumbleInfo.recoverySpot = finalDescription.slice(finalDescription.indexOf(' at ') + 4, finalDescription.length - 1);
                    

                    let initialSpotYard = fumbleInfo.initialSpot.slice(fumbleInfo.initialSpot.length - 2);
                    if(initialSpotYard[0] == ' ') {
                        initialSpotYard = initialSpotYard.slice(1);
                    }
                    initialSpotYard = parseInt(initialSpotYard);

                    let recoverySpotYard = fumbleInfo.recoverySpot.slice(fumbleInfo.recoverySpot.length - 2);
                    if(recoverySpotYard[0] == ' ') {
                        recoverySpotYard = recoverySpotYard.slice(1);
                    }
                    recoverySpotYard = parseInt(recoverySpotYard);

                    if(fumbleInfo.ballMoved > 0 && fumbleInfo.initialYards > 0 && fumbleInfo.initialYards > fumbleInfo.ballMoved) {
                        statEntry.yards = fumbleInfo.ballMoved;
                    } else if(fumbleInfo.ballMoved > 0 && fumbleInfo.initialYards > 0 && fumbleInfo.initialYards < fumbleInfo.ballMoved) {
                        statEntry.yards = fumbleInfo.initialYards;
                    } else if(fumbleInfo.initialYards < 0 && play.yards >= 0) {
                        fumbleInfo.initialYards = 0;
                    } else if(fumbleInfo.initialYards < 0 && play.yards < 0 && play.yards > fumbleInfo.initialYards) {
                        fumbleInfo.initialYards = play.yards;
                        statEntry.yards = play.yards;
                    }
                    fumbleInfo.statYards.push(statEntry);
                }

                let totalRecoveryYards = 0;
                for(const key in fumbleText) {

                    if(!fumbleText[key].includes('MUFFS')) {

                        let recoveryTeam;
                        let recoveryYards;
                        if(fumbleText[key].includes('and recovers') && fumbleText[key].includes('(Aborted)')) {
                            recoveryTeam = play.team;
                            recoveryYards = play.secondDescription.slice(play.secondDescription.indexOf('Yrd Fumble Recovery') - 4, play.secondDescription.indexOf('Yrd Fumble Recovery') - 1);
                            if(recoveryYards != '-') {
                                recoveryYards = recoveryYards.slice(1);
                            }
                            recoveryYards = parseInt(recoveryYards);
                        } else {
                            recoveryTeam = fumbleText[key].slice(fumbleText[key].indexOf(' by ') + 4, fumbleText[key].indexOf(' by ') + 7);
                            if(recoveryTeam[2] == '-') {
                                recoveryTeam = recoveryTeam.slice(0, 2);
                            }
                        
                            recoveryYards = fumbleText[key].slice(fumbleText[key].indexOf(' for ') + 5, fumbleText[key].indexOf(' for ') + 8);
                            if(recoveryYards.includes('no')) {
                                recoveryYards = 0;
                            } else if(recoveryYards[2] == ' ') {
                                recoveryYards = recoveryYards.slice(0, 2);
                            } else if(recoveryYards[2] == 'y') {
                                recoveryYards = recoveryYards.slice (0, 1);
                            }
                            recoveryYards = parseInt(recoveryYards);

                            if(fumbleInfo.turnover == false) {
                                if(fumbleInfo.initialYards < 0 && recoveryYards > 0 && play.yards <= 0) {
                                    recoveryYards = 0;
                                } else if(fumbleInfo.initialYards < 0 && recoveryYards > 0 && play.yards > 0) {
                                    if(key == 0 && recoveryYards + fumbleInfo.initialYards <= 0) {
                                        recoveryYards = 0;
                                    } else {
                                        recoveryYards = recoveryYards + fumbleInfo.initialYards;
                                    }
                                }
                            }
                        }

                        let recoveryEntry = {
                            player: recoveryTeam,
                            yards: recoveryYards,
                        }
                        if(recoveryTeam == play.team) {
                            fumbleInfo.statYards.push(recoveryEntry);
                            totalRecoveryYards += recoveryYards;
                        } else {
                            fumbleInfo.oppYards.push(recoveryEntry);
                        }
                        
                    }
                }

                if(fumbleInfo.turnover == false) {
                    if(fumbleInfo.initialYards < 0 && fumbleInfo.statYards[1] && fumbleInfo.statYards[1] <= 0) {
                        fumbleInfo.statYards[0].yards = fumbleInfo.ballMoved - fumbleInfo.statYards[1].yards;
                    } else if(fumbleInfo.initialYards < 0 && totalRecoveryYards > 0 && play.yards <= 0) {
                        fumbleInfo.statYards[0].yards = play.yards;
                    } 
                } else if(finalDescription.includes('MUFFS')) {

                    fumbleInfo.statYards.push({
                        player,
                        yards: 0,
                        recovery: false,
                    });
                 
                } else {
                    if(fumbleInfo.initialYards < 0 && !fumbleInfo.statYards[1]) fumbleInfo.statYards[0].yards = fumbleInfo.ballMoved;
                }
                 
            } 

            
            return fumbleInfo;
        }

        // extracts enforced penalty yardage from play description 
        const getTruePenalty = (playTeam, oppTeam, description, secondDescription, playType, playYardage) => {
            let truePenaltyInfo = {
                penalties: [],
                trueYards: playYardage,
            };

            let penaltyText = [];

            let firstPenalty = description.slice(description.indexOf('PENALTY'));
            let secondPenalty = description.slice(description.indexOf('PENALTY') + 7);
            // current logic maxes out at 3 penalties
            if(secondPenalty.includes('PENALTY')) {
                let index = firstPenalty.indexOf('PENALTY', firstPenalty.indexOf('PENALTY') + 1);
                secondPenalty = firstPenalty.slice(index);
                firstPenalty = firstPenalty.slice(0, index);
                penaltyText.push(firstPenalty);

                let thirdPenalty = secondPenalty.slice(secondPenalty.indexOf('PENALTY') + 7);
                if(thirdPenalty.includes('PENALTY')) {
                    let secondIndex = secondPenalty.indexOf('PENALTY', secondPenalty.indexOf('PENALTY') + 1);
                    thirdPenalty = secondPenalty.slice(secondIndex);
                    secondPenalty = secondPenalty.slice(0, secondIndex);
                    penaltyText.push(secondPenalty);
                    penaltyText.push(thirdPenalty);
                } else {
                    penaltyText.push(secondPenalty);
                }
            } else {
                penaltyText.push(firstPenalty);
            }
            
            for(let i = 0; i < penaltyText.length; i++) {
                let entry = {
                    against: null,
                    yards: parseInt(penaltyText[i].slice(penaltyText[i].indexOf(' yards') - 2, penaltyText[i].indexOf(' yards'))),
                    spotEnforced: null,
                    between: false,
                }

                if(penaltyText[i].includes(`PENALTY on ${playTeam}`)) {
                    entry.against = playTeam;
                    // 26 = interceptions, where playYardage = int-return yards, even though playTeam is still the throwing team
                    // 52 = punt return, where playYardagee = punt-return yards ....
                    if(playType == 26 || playType == 52) {
                        truePenaltyInfo.trueYards = truePenaltyInfo.trueYards - entry.yards;
                    } else {
                        truePenaltyInfo.trueYards += entry.yards;
                    }
                } else {
                    entry.against = oppTeam;
                    if(playType == 26 || playType == 52) {
                        truePenaltyInfo.trueYards += entry.yards;
                    } else {
                        truePenaltyInfo.trueYards = truePenaltyInfo.trueYards - entry.yards;
                    }
                }

                if(penaltyText[i].includes('between downs')) {
                    entry.between = true;
                } else {
                    if(penaltyText.length == 1) {
                        entry.spotEnforced = penaltyText[i].slice(penaltyText[i].indexOf('enforced at') + 12, penaltyText[i].length - 1);
                    } else if(penaltyText.length == 2) {
                        if(i == 0) {
                            entry.spotEnforced = penaltyText[i].slice(penaltyText[i].indexOf('enforced at') + 12);
                            entry.spotEnforced = entry.spotEnforced.slice(0, entry.spotEnforced.indexOf('.'));
                        } else {
                            entry.spotEnforced = penaltyText[i].slice(penaltyText[i].indexOf('enforced at') + 12, penaltyText[i].length - 1);
                        }
                    } else if(penaltyText.length == 3) {
                        if(i < 2) {
                            entry.spotEnforced = penaltyText[i].slice(penaltyText[i].indexOf('enforced at') + 12);
                            entry.spotEnforced = entry.spotEnforced.slice(0, entry.spotEnforced.indexOf('.'));
                        } else {
                            entry.spotEnforced = penaltyText[i].slice(penaltyText[i].indexOf('enforced at') + 12, penaltyText[i].length - 1);
                        }
                    }
                }
            
                truePenaltyInfo.penalties.push(entry);
            }

            return truePenaltyInfo;
        }
        // processes DEF yards allowed ....TO-DO: Net yards when turnovers (fumble/int), yards before and after fumble + own recovery, etc.
        const defensiveYards = (homeTeam, awayTeam, homeStart, homeYards, awayStart, awayYards, playObj) => {
            let defensiveYardsInfo = {
                defYdsThreshBreakers: [],
                newAwayYards: awayYards,
                newHomeYards: homeYards,
            };

            if(playObj.team == homeTeam) { 

                if(awayStart == true) {
                    let oldYA = defensiveYardsInfo.newAwayYards;

                    if((playObj.playType == 5 || playObj.playType == 7 || playObj.playType == 9 || playObj.playType == 20 || playObj.playType == 24 || playObj.playType == 67 || playObj.playType == 68)) {
                        
                        if(playObj.playType == 5) {
                            if(playObj.penalty == true) {
                                defensiveYardsInfo.newAwayYards += playObj.penaltyInfo.trueYards;
                            } else {
                                defensiveYardsInfo.newAwayYards += playObj.yards;
                            }
                        } else if(playObj.playType == 9) {
                            let fumbleInfo = processFumble(playObj, awayTeam);
                            if(fumbleInfo != null) {
                                for(const fumble in fumbleInfo.statYards) {
                                    defensiveYardsInfo.newAwayYards += fumbleInfo.statYards[fumble].yards;
                                }
                            }

                            if(playObj.penalty == true) {
                                for(const key in playObj.penaltyInfo.penalties) {
                                    if(playObj.penaltyInfo.penalties[key].against == awayTeam && playObj.penaltyInfo.penalties[key].between == false) {
                                        defensiveYardsInfo.newAwayYards = defensiveYardsInfo.newAwayYards - playObj.penaltyInfo.penalties[key].yards;
                                    } else if(playObj.penaltyInfo.penalties[key].against == homeTeam && playObj.penaltyInfo.penalties[key].between == false) {
                                        defensiveYardsInfo.newAwayYards += playObj.penaltyInfo.penalties[key].yards;
                                    }
                                }
                            }  
                            
                        } else if(playObj.playType == 7 && playObj.description.includes('FUMBLES')) {
                            let fumbleInfo = processFumble(playObj, awayTeam);
                            if(fumbleInfo != null) {
                                for(const fumble in fumbleInfo.statYards) {
                                    defensiveYardsInfo.newAwayYards += fumbleInfo.statYards[fumble].yards;
                                }
                                if(fumbleInfo.turnover == true) {
                                    for(const fumble in fumbleInfo.oppYards) {
                                        defensiveYardsInfo.newAwayYards = defensiveYardsInfo.newAwayYards - fumbleInfo.oppYards[fumble].yards;
                                    }
                                }
                            } else {
                                defensiveYardsInfo.newAwayYards += playObj.yards;
                            }

                            if(playObj.penalty == true) {
                                for(const key in playObj.penaltyInfo.penalties) {
                                    if(playObj.penaltyInfo.penalties[key].against == awayTeam && playObj.penaltyInfo.penalties[key].between == false) {
                                        defensiveYardsInfo.newAwayYards = defensiveYardsInfo.newAwayYards - playObj.penaltyInfo.penalties[key].yards;
                                    } else if(playObj.penaltyInfo.penalties[key].against == homeTeam && playObj.penaltyInfo.penalties[key].between == false) {
                                        defensiveYardsInfo.newAwayYards += playObj.penaltyInfo.penalties[key].yards;
                                    }
                                }
                            }  
                        } else {
                            
                            defensiveYardsInfo.newAwayYards += playObj.yards;  

                            if(playObj.penalty == true) {
                                for(const key in playObj.penaltyInfo.penalties) {
                                    if(playObj.penaltyInfo.penalties[key].against == awayTeam && playObj.penaltyInfo.penalties[key].between == false) {
                                        defensiveYardsInfo.newAwayYards = defensiveYardsInfo.newAwayYards - playObj.penaltyInfo.penalties[key].yards;
                                    } else if(playObj.penaltyInfo.penalties[key].against == homeTeam && playObj.penaltyInfo.penalties[key].between == false) {
                                        defensiveYardsInfo.newAwayYards += playObj.penaltyInfo.penalties[key].yards;
                                    }
                                }
                            }  
                        }  
                                        
                    } else if(playObj.playType == 26 || playObj.playType == 36 || playObj.playType == 39 || (playObj.playType == 52 && score.def_pr_yd) || ((playObj.playType == 12 || playObj.playType == 32) && score.def_kr_yd) || ((playObj.playType == 17 || playObj.playType == 37) && score.blk_kick_ret_yd)) {

                        if(playObj.penalty == true) {
                            for(const key in playObj.penaltyInfo.penalties) {
                                if(playObj.penaltyInfo.penalties[key].against == awayTeam && playObj.yards > 0 && playObj.penaltyInfo.penalties[key].between == false) {
                                    defensiveYardsInfo.newAwayYards = defensiveYardsInfo.newAwayYards - playObj.yards;
                                } else if(playObj.penaltyInfo.penalties[key].against == homeTeam && playObj.penaltyInfo.penalties[key].between == false) {
                                    defensiveYardsInfo.newAwayYards += playObj.penaltyInfo.penalties[key].yards - playObj.yards;
                                }
                            }
                        } else {
                            defensiveYardsInfo.newAwayYards = defensiveYardsInfo.newAwayYards - playObj.yards;
                        }

                    } else if(playObj.playType == 29) {
                        // statYardage counts yards before fumble
                        defensiveYardsInfo.newAwayYards += playObj.yards; 
                        // now debit the defense with recovery yards
                        let recoveryYards = 0;
                        if(playObj.secondDescription.includes('Yrd Fumble Recovery')) {
                            recoveryYards = playObj.secondDescription.slice(playObj.secondDescription.indexOf('Yrd Fumble Recovery') - 3, playObj.secondDescription.indexOf('Yrd Fumble Recovery'));
                            if(recoveryYards.slice(0, 1) == ' ') {
                                recoveryYards = parseInt(recoveryYards.slice(1, 2)); // TO-DO this doesn't always work, see buffalo game, texans dolphins week 9
                            } else {
                                recoveryYards = parseInt(recoveryYards.slice(0, 2));
                            }
                            defensiveYardsInfo.newAwayYards = defensiveYardsInfo.newAwayYards - recoveryYards;
                        }
                    }
                    // check if threshold broken
                    if((oldYA < 100 && defensiveYardsInfo.newAwayYards >= 100) || (oldYA < 200 && defensiveYardsInfo.newAwayYards >= 200) || (oldYA < 300 && defensiveYardsInfo.newAwayYards >= 300) || (oldYA < 350 && defensiveYardsInfo.newAwayYards >= 350) ||
                    (oldYA < 400 && defensiveYardsInfo.newAwayYards >= 400) || (oldYA < 450 && defensiveYardsInfo.newAwayYards >= 450) || (oldYA < 500 && defensiveYardsInfo.newAwayYards >= 500) || (oldYA < 550 && defensiveYardsInfo.newAwayYards >= 550)) {
                        defensiveYardsInfo.defYdsThreshBreakers.push({
                            old: oldYA,
                            new: defensiveYardsInfo.newAwayYards,
                            playInfo: playObj,
                            defense: awayTeam,
                        });
                    }
                }
                // if league tracks special teams return yardage, credit to the returning team & debit from the kicking team
                if(homeStart == true && ((playObj.playType == 52 && score.def_pr_yd) || ((playObj.playType == 12 || playObj.playType == 32) && score.def_kr_yd) || ((playObj.playType == 17 || playObj.playType == 37) && score.blk_kick_ret_yd))) {
                    let oldYA = defensiveYardsInfo.newHomeYards;
                    defensiveYardsInfo.newHomeYards += playObj.yards;

                    if(playObj.penalty == true) {
                        for(const key in playObj.penaltyInfo.penalties) {
                            if(playObj.penaltyInfo.penalties[key].against == homeTeam && playObj.penaltyInfo.penalties[key].between == false) {
                                defensiveYardsInfo.newHomeYards = defensiveYardsInfo.newHomeYards - playObj.penaltyInfo.penalties[key].yards;
                            } 
                        }
                    }  

                    // check if threshold broken
                    if((oldYA < 100 && defensiveYardsInfo.newHomeYards >= 100) || (oldYA < 200 && defensiveYardsInfo.newHomeYards >= 200) || (oldYA < 300 && defensiveYardsInfo.newHomeYards >= 300) || (oldYA < 350 && defensiveYardsInfo.newHomeYards >= 350) ||
                        (oldYA < 400 && defensiveYardsInfo.newHomeYards >= 400) || (oldYA < 450 && defensiveYardsInfo.newHomeYards >= 450) || (oldYA < 500 && defensiveYardsInfo.newHomeYards >= 500) || (oldYA < 550 && defensiveYardsInfo.newHomeYards >= 550)) {
                        defensiveYardsInfo.defYdsThreshBreakers.push({
                            old: oldYA,
                            new: defensiveYardsInfo.newHomeYards,
                            playInfo: playObj,
                            defense: homeTeam,
                        });
                    }
                }
            } else if(playObj.team == awayTeam) { 
                if(homeStart == true) {
                    let oldYA = defensiveYardsInfo.newHomeYards;  

                    if((playObj.playType == 5 || playObj.playType == 7 || playObj.playType == 9 || playObj.playType == 20 || playObj.playType == 24 || playObj.playType == 67 || playObj.playType == 68)) {
                        
                        if(playObj.playType == 5) {
                            if(playObj.penalty == true) {
                                defensiveYardsInfo.newHomeYards += playObj.penaltyInfo.trueYards;
                            } else {
                                defensiveYardsInfo.newHomeYards += playObj.yards;
                            }
                        }  else if(playObj.playType == 7 && playObj.description.includes('FUMBLES')) {
                            let fumbleInfo = processFumble(playObj, awayTeam);
                            if(fumbleInfo != null) {
                                for(const fumble in fumbleInfo.statYards) {
                                    defensiveYardsInfo.newHomeYards += fumbleInfo.statYards[fumble].yards;
                                }
                                if(fumbleInfo.turnover == true) {
                                    for(const fumble in fumbleInfo.oppYards) {
                                        defensiveYardsInfo.newHomeYards = defensiveYardsInfo.newHomeYards - fumbleInfo.oppYards[fumble].yards;
                                    }
                                }
                            } else {
                                defensiveYardsInfo.newHomeYards += playObj.yards;
                            }

                            if(playObj.penalty == true) {
                                for(const key in playObj.penaltyInfo.penalties) {
                                    if(playObj.penaltyInfo.penalties[key].against == homeTeam && playObj.penaltyInfo.penalties[key].between == false) {
                                        defensiveYardsInfo.newHomeYards = defensiveYardsInfo.newHomeYards - playObj.penaltyInfo.penalties[key].yards;
                                    } else if (playObj.penaltyInfo.penalties[key].against == awayTeam && playObj.penaltyInfo.penalties[key].between == false) {
                                        defensiveYardsInfo.newHomeYards += playObj.penaltyInfo.penalties[key].yards;
                                    }
                                }
                            }  
                        } else if(playObj.playType == 9) {
                            let fumbleInfo = processFumble(playObj, homeTeam);
                            if(fumbleInfo != null) {
                                for(const fumble in fumbleInfo.statYards) {
                                    defensiveYardsInfo.newHomeYards += fumbleInfo.statYards[fumble].yards;
                                }
                            }

                            if(playObj.penalty == true) {
                                for(const key in playObj.penaltyInfo.penalties) {
                                    if(playObj.penaltyInfo.penalties[key].against == homeTeam && playObj.penaltyInfo.penalties[key].between == false) {
                                        defensiveYardsInfo.newHomeYards = defensiveYardsInfo.newHomeYards - playObj.penaltyInfo.penalties[key].yards;
                                    } else if (playObj.penaltyInfo.penalties[key].against == awayTeam && playObj.penaltyInfo.penalties[key].between == false) {
                                        defensiveYardsInfo.newHomeYards += playObj.penaltyInfo.penalties[key].yards;
                                    }
                                }
                            }  
                        } else {

                            defensiveYardsInfo.newHomeYards += playObj.yards;  

                            if(playObj.penalty == true) {
                                for(const key in playObj.penaltyInfo.penalties) {
                                    if(playObj.penaltyInfo.penalties[key].against == homeTeam && playObj.penaltyInfo.penalties[key].between == false) {
                                        defensiveYardsInfo.newHomeYards = defensiveYardsInfo.newHomeYards - playObj.penaltyInfo.penalties[key].yards;
                                    } else if (playObj.penaltyInfo.penalties[key].against == awayTeam && playObj.penaltyInfo.penalties[key].between == false) {
                                        defensiveYardsInfo.newHomeYards += playObj.penaltyInfo.penalties[key].yards;
                                    }
                                }
                            }  
                        }  
                        
                    } else if(playObj.playType == 26 || playObj.playType == 36 || playObj.playType == 39 || (playObj.playType == 52 && score.def_pr_yd) || ((playObj.playType == 12 || playObj.playType == 32) && score.def_kr_yd) || ((playObj.playType == 17 || playObj.playType == 37) && score.blk_kick_ret_yd)) {

                        if(playObj.penalty == true) {
                            for(const key in playObj.penaltyInfo.penalties) {
                                if(playObj.penaltyInfo.penalties[key].against == homeTeam && playObj.yards > 0 && playObj.penaltyInfo.penalties[key].between == false) {
                                    defensiveYardsInfo.newHomeYards = defensiveYardsInfo.newHomeYards - playObj.yards;
                                } else if(playObj.penaltyInfo.penalties[key].against == awayTeam && playObj.penaltyInfo.penalties[key].between == false) {
                                    defensiveYardsInfo.newHomeYards += playObj.penaltyInfo.penalties[key].yards - playObj.yards;
                                }
                            }
                        } else {
                            defensiveYardsInfo.newHomeYards = defensiveYardsInfo.newHomeYards - playObj.yards;
                        }

                    } else if(playObj.playType == 29) {
                        // statYardage counts yards before fumble
                        defensiveYardsInfo.newHomeYards += playObj.yards; 
                        // now debit the defense with recovery yards
                        let recoveryYards = 0;
                        if(playObj.secondDescription.includes('Yrd Fumble Recovery')) {
                            recoveryYards = playObj.secondDescription.slice(playObj.secondDescription.indexOf('Yrd Fumble Recovery') - 3, playObj.secondDescription.indexOf('Yrd Fumble Recovery'));
                            if(recoveryYards.slice(0, 1) == ' ') {
                                recoveryYards = parseInt(recoveryYards.slice(1, 2));
                            } else {
                                recoveryYards = parseInt(recoveryYards.slice(0, 2));
                            }
                        }
                        defensiveYardsInfo.newHomeYards = defensiveYardsInfo.newHomeYards - recoveryYards;
                    }
                    // check if threshold broken
                    if((oldYA < 100 && defensiveYardsInfo.newHomeYards >= 100) || (oldYA < 200 && defensiveYardsInfo.newHomeYards >= 200) || (oldYA < 300 && defensiveYardsInfo.newHomeYards >= 300) || (oldYA < 350 && defensiveYardsInfo.newHomeYards >= 350) ||
                        (oldYA < 400 && defensiveYardsInfo.newHomeYards >= 400) || (oldYA < 450 && defensiveYardsInfo.newHomeYards >= 450) || (oldYA < 500 && defensiveYardsInfo.newHomeYards >= 500) || (oldYA < 550 && defensiveYardsInfo.newHomeYards >= 550)) {
                        defensiveYardsInfo.defYdsThreshBreakers.push({
                            old: oldYA,
                            new: defensiveYardsInfo.newHomeYards,
                            playInfo: playObj,
                            defense: homeTeam,
                        });
                    }
                    
                }
                if(awayStart == true && ((playObj.playType == 52 && score.def_pr_yd) || ((playObj.playType == 12 || playObj.playType == 32) && score.def_kr_yd) || ((playObj.playType == 17 || playObj.playType == 37) && score.blk_kick_ret_yd))) {
                    let oldYA = defensiveYardsInfo.newAwayYards;
                    defensiveYardsInfo.newAwayYards = defensiveYardsInfo.newAwayYards - playObj.yards;

                    if(playObj.penalty == true) {
                        for(const key in playObj.penaltyInfo.penalties) {
                            if(playObj.penaltyInfo.penalties[key].against == awayTeam && playObj.penaltyInfo.penalties[key].between == false) {
                                defensiveYardsInfo.newAwayYards = defensiveYardsInfo.newAwayYards - playObj.penaltyInfo.penalties[key].yards;
                            } 
                        }
                    }  
                    // check if threshold broken
                    if((oldYA < 100 && defensiveYardsInfo.newAwayYards >= 100) || (oldYA < 200 && defensiveYardsInfo.newAwayYards >= 200) || (oldYA < 300 && defensiveYardsInfo.newAwayYards >= 300) || (oldYA < 350 && defensiveYardsInfo.newAwayYards >= 350) ||
                        (oldYA < 400 && defensiveYardsInfo.newAwayYards >= 400) || (oldYA < 450 && defensiveYardsInfo.newAwayYards >= 450) || (oldYA < 500 && defensiveYardsInfo.newAwayYards >= 500) || (oldYA < 550 && defensiveYardsInfo.newAwayYards >= 550)) {
                        defensiveYardsInfo.defYdsThreshBreakers.push({
                            old: oldYA,
                            new: defensiveYardsInfo.newAwayYards,
                            playInfo: playObj,
                            defense: awayTeam,
                        });
                    }
                }
            }
            return defensiveYardsInfo;
        }

        // calculates game-long points bonuses
        let bonusTracker = {};
        const processBonus = (adjustedYards, player, statType, extraInfo) => {
            let bonusInfo = {
                fpts: 0,
                bonus: false,
                bonusDesc: [],
            };
            
            if(statType == 'receiving') {
 
                if(extraInfo == 'reception') {
                    if(0 < adjustedYards && adjustedYards < 5 && score.rec_0_4) {                                                                       // RECEPTION YD BONUS
                        receptionBonusInfo.fpts = score.rec_0_4;
                        pushRunningTotal(score.rec_0_4, statDescriptions['rec_0_4'], Object.keys(statDescriptions['rec_0_4']), 1, player.playerInfo.playerID, player.playerInfo.pos); 
                    } else if(4 < adjustedYards && adjustedYards < 10 && score.rec_5_9) {
                        receptionBonusInfo.fpts = score.rec_5_9;
                        pushRunningTotal(score.rec_5_9, statDescriptions['rec_5_9'], Object.keys(statDescriptions['rec_5_9']), 1, player.playerInfo.playerID, player.playerInfo.pos); 
                    } else if(9 < adjustedYards && adjustedYards < 20 && score.rec_10_19) {
                        receptionBonusInfo.fpts = score.rec_10_19;
                        pushRunningTotal(score.rec_10_19, statDescriptions['rec_10_19'], Object.keys(statDescriptions['rec_10_19']), 1, player.playerInfo.playerID, player.playerInfo.pos); 
                    } else if(19 < adjustedYards && adjustedYards < 30 && score.rec_20_29) {
                        receptionBonusInfo.fpts = score.rec_20_29;
                        pushRunningTotal(score.rec_20_29, statDescriptions['rec_20_29'], Object.keys(statDescriptions['rec_20_29']), 1, player.playerInfo.playerID, player.playerInfo.pos); 
                    } else if(29 < adjustedYards && adjustedYards < 40 && score.rec_30_39) {
                        receptionBonusInfo.fpts = score.rec_30_39;
                        pushRunningTotal(score.rec_30_39, statDescriptions['rec_30_39'], Object.keys(statDescriptions['rec_30_39']), 1, player.playerInfo.playerID, player.playerInfo.pos); 
                    } else if(adjustedYards >= 40 && score.rec_40p) {
                        receptionBonusInfo.fpts = score.rec_40p;
                        pushRunningTotal(score.rec_40p, statDescriptions['rec_40p'], Object.keys(statDescriptions['rec_40p']), 1, player.playerInfo.playerID, player.playerInfo.pos); 
                    }
                }
                if(score.bonus_rec_yd_100 || score.bonus_rec_yd_200 || score.bonus_rush_rec_yd_100 || score.bonus_rush_rec_yd_200) {
                    if(!bonusTracker[player.playerInfo.playerID]) {
                        bonusTracker[player.playerInfo.playerID] = {
                            receivingYards: 0,
                        }
                    } else if(!bonusTracker[player.playerInfo.playerID].receivingYards) {
                        bonusTracker[player.playerInfo.playerID].receivingYards = 0;
                    }
                    let oldYards = bonusTracker[player.playerInfo.playerID].receivingYards
                    bonusTracker[player.playerInfo.playerID].receivingYards += adjustedYards;
                    
                    if(score.bonus_rec_yd_100 && oldYards < 100 && bonusTracker[player.playerInfo.playerID].receivingYards >= 100) {
                        bonusInfo.fpts += score.bonus_rec_yd_100;
                        bonusInfo.bonus = true;
                        bonusInfo.bonusDesc.push('100+ RECEIVING YARDS');
                    } else if(score.bonus_rec_yd_200 && oldYards >= 100 && oldYards < 200 && bonusTracker[player.playerInfo.playerID].receivingYards >= 200) {
                        bonusInfo.fpts += score.bonus_rec_yd_200;
                        bonusInfo.bonus = true;
                        bonusInfo.bonusDesc.push('200+ RECEIVING YARDS');
                    }
                    if(score.bonus_rush_rec_yd_100 || score.bonus_rush_rec_yd_200) {
                        oldYards += bonusTracker[player.playerInfo.playerID]?.rushingYards || 0;
                        const newYards = bonusTracker[player.playerInfo.playerID].receivingYards + (bonusTracker[player.playerInfo.playerID]?.rushingYards || 0);
                
                        if(score.bonus_rush_rec_yd_100 && oldYards < 100 && newYards >= 100) {
                            bonusInfo.fpts += score.bonus_rush_rec_yd_100;
                            bonusInfo.bonus = true;
                            bonusInfo.bonusDesc.push('100+ COMBINED RUSH/REC YARDS');
                        } else if(score.bonus_rush_rec_yd_200 && oldYard >= 100 && oldYards < 200 && newYards >= 200) {
                            bonusInfo.fpts += score.bonus_rush_rec_yd_200;
                            bonusInfo.bonus = true;
                            bonusInfo.bonusDesc.push('200+ COMBINED RUSH/REC YARDS');
                        }
                    }
                }
            } else if(statType == 'passing') {

                if(!bonusTracker[player.playerInfo.playerID]) bonusTracker[player.playerInfo.playerID] = {};
                if(score.bonus_pass_yd_300 || score.bonus_pass_yd_400) {
                    if(!bonusTracker[player.playerInfo.playerID].passingYards) bonusTracker[player.playerInfo.playerID].passingYards = 0;
                    let oldYards = bonusTracker[player.playerInfo.playerID].passingYards;
                    bonusTracker[player.playerInfo.playerID].passingYards += adjustedYards;
                    if(score.bonus_pass_yd_300 && oldYards < 300 && bonusTracker[player.playerInfo.playerID].passingYards >= 300) {
                        bonusInfo.fpts += score.bonus_pass_yd_300;
                        bonusInfo.bonus = true;
                        bonusInfo.bonusDesc.push('300+ PASSING YARDS');
                    } else if(score.bonus_pass_yd_400 && oldYards >= 300 && oldYards < 400 && bonusTracker[player.playerInfo.playerID].passingYards >= 400) {
                        bonusInfo.fpts += score.bonus_pass_yd_400;
                        bonusInfo.bonus = true;
                        bonusInfo.bonusDesc.push('400+ PASSING YARDS');
                    }
                }

                if(score.bonus_pass_cmp_25) {
                    if(!bonusTracker[player.playerInfo.playerID].completions) bonusTracker[player.playerInfo.playerID].completions = 0;
                    bonusTracker[player.playerInfo.playerID].completions++;
                    if(bonusTracker[player.playerInfo.playerID].completions == 25) {
                        bonusInfo.fpts += score.bonus_pass_cmp_25;
                        bonusInfo.bonus = true;
                        bonusInfo.bonusDesc.push('25+ COMPLETIONS')
                    }
                }

            } else if(statType == 'rushing') {

                if(!bonusTracker[player.playerInfo.playerID]) bonusTracker[player.playerInfo.playerID] = {};
                if(score.bonus_rush_att_20) {
                    if(!bonusTracker[player.playerInfo.playerID].carries) bonusTracker[player.playerInfo.playerID].carries = 0;
                    bonusTracker[player.playerInfo.playerID].carries++;
                    if(bonusTracker[player.playerInfo.playerID].carries == 20) {
                        entry.fpts += score.bonus_rush_att_20;
                        entry.bonus = true;
                        entry.bonusDesc.push('20+ CARRIES');
                    }
                }

                if(score.bonus_rush_yd_100 || score.bonus_rush_yd_200 || score.bonus_rush_rec_yd_100 || score.bonus_rush_rec_yd_200) {
                    if(!bonusTracker[player.playerInfo.playerID].rushingYards) bonusTracker[player.playerInfo.playerID].rushingYards = 0;
                    let oldYards = bonusTracker[player.playerInfo.playerID].rushingYards
                    bonusTracker[player.playerInfo.playerID].rushingYards += adjustedYards;
                    
                    if(score.bonus_rush_yd_100 && oldYards < 100 && bonusTracker[player.playerInfo.playerID].rushingYards >= 100) {
                        bonusInfo.fpts += score.bonus_rush_yd_100;
                        bonusInfo.bonus = true;
                        bonusInfo.bonusDesc.push('100+ RUSHING YARDS');
                    } else if(score.bonus_rush_yd_200 && oldYards >= 100 && oldYards < 200 && bonusTracker[player.playerInfo.playerID].rushingYards >= 200) {
                        bonusInfo.fpts += score.bonus_rush_yd_200;
                        bonusInfo.bonus = true;
                        bonusInfo.bonusDesc.push('200+ RUSHING YARDS');
                    }
                    if(score.bonus_rush_rec_yd_100 || score.bonus_rush_rec_yd_200) {
                        oldYards += bonusTracker[player.playerInfo.playerID]?.receivingYards || 0;
                        const newYards = bonusTracker[player.playerInfo.playerID].rushingYards + (bonusTracker[player.playerInfo.playerID]?.receivingYards || 0);
                
                        if(score.bonus_rush_rec_yd_100 && oldYards < 100 && newYards >= 100) {
                            bonusInfo.fpts += score.bonus_rush_rec_yd_100;
                            bonusInfo.bonus = true;
                            bonusInfo.bonusDesc.push('100+ COMBINED RUSH/REC YARDS');
                        } else if(score.bonus_rush_rec_yd_200 && oldYards >= 100 && oldYards < 200 && newYards >= 200) {
                            bonusInfo.fpts += score.bonus_rush_rec_yd_200;
                            bonusInfo.bonus = true;
                            bonusInfo.bonusDesc.push('200+ COMBINED RUSH/REC YARDS');
                        }
                    }
                }
                
            } else if(statType == 'idp') {

                if(!bonusTracker[player.playerInfo.playerID]) bonusTracker[player.playerInfo.playerID] = {};

                if(extraInfo == 'tackling') {

                    if(!bonusTracker[player.playerInfo.playerID].tackles) bonusTracker[player.playerInfo.playerID].tackles = 0;
                    bonusTracker[player.playerInfo.playerID].tackles++;
                    if(bonusTracker[player.playerInfo.playerID].tackles == 10) {
                        bonusInfo.fpts += score.bonus_tkl_10p;
                        bonusInfo.bonus = true;
                        bonusInfo.bonusDesc.push('10+ TACKLES');       
                    }
                } else if(extraInfo == 'sacks') {

                    if(!bonusTracker[player.playerInfo.playerID].sacks) bonusTracker[player.playerInfo.playerID].sacks = 0;
                    bonusTracker[player.playerInfo.playerID].sacks++;
                    if(bonusTracker[player.playerInfo.playerID].sacks == 2) {
                        bonusInfo.fpts += score.bonus_sack_2p;
                        bonusInfo.bonus = true;
                        bonusInfo.bonusDesc.push('2+ SACKS');       
                    }

                } else if(extraInfo == 'passDefense') {

                    if(!bonusTracker[player.playerInfo.playerID].passDefends) bonusTracker[player.playerInfo.playerID].passDefends = 0;
                    bonusTracker[player.playerInfo.playerID].passDefends++;
                    if(bonusTracker[player.playerInfo.playerID].passDefends == 3) {
                        bonusInfo.fpts += score.idp_pass_def_3p;
                        bonusInfo.bonus = true;
                        bonusInfo.bonusDesc.push('3+ PASSES DEFENDED');
                    }
                }
                    
            }

            return bonusInfo;
        }

        // tracks individual players' stat totals
        let runningTotals = {};
        const pushRunningTotal = (fpts, statDesc, stat, metric, playerID, position) => {
            if(!runningTotals[playerID]) {
                runningTotals[playerID] = {
                    fpts: 0,
                    stats: [],
                    info: {},
                    playerID: playerID,
                    pos: position,
                }
            }
             
            runningTotals[playerID].fpts += fpts;

            if(!runningTotals[playerID].stats.find(r => r.statDesc == statDesc)) {
                runningTotals[playerID].stats.push({
                    stat: stat,
                    statDesc: statDesc,
                    metric: metric,
                    fpts: fpts,
                }) 
            } else {
                const runningStat = runningTotals[playerID].stats.find(r => r.statDesc == statDesc);
                runningStat.metric += metric;
                runningStat.fpts += fpts;
            }
        }
        // calculates FPTS due to DEF points allowed
        const calculateDefPointsAllowed = (teamScore) => {
            let DEFscore = 0;
            let DEFthreshold;
            let DEFdescription;
            if(score.pts_allow) DEFscore += teamScore * score.pts_allow;
            if(teamScore == 0) {
                DEFscore += (score?.pts_allow_0 || 0);
                DEFthreshold = 'pts_allow_0';
                DEFdescription = 'Zero Points Allowed';
            } else if(teamScore > 0 && teamScore < 7) {
                DEFscore += (score?.pts_allow_1_6 || 0);
                DEFthreshold = 'pts_allow_1_6';
                DEFdescription = 'Points Allowed (1-6)';
            } else if(teamScore > 6 && teamScore < 14) {
                DEFscore += (score?.pts_allow_7_13 || 0);
                DEFthreshold = 'pts_allow_7_13';
                DEFdescription = 'Points Allowed (7-13)';
            } else if(teamScore > 13 && teamScore < 21) {
                DEFscore += (score?.pts_allow_14_20 || 0);
                DEFthreshold = 'pts_allow_14_20';
                DEFdescription = 'Points Allowed (14-20)';
            } else if(teamScore > 20 && teamScore < 28) {
                DEFscore += (score?.pts_allow_21_27 || 0);
                DEFthreshold = 'pts_allow_21_27';
                DEFdescription = 'Points Allowed (21-27)';
            } else if(teamScore > 27 && teamScore < 35) {
                DEFscore += (score?.pts_allow_28_34 || 0);
                DEFthreshold = 'pts_allow_28_34';
                DEFdescription = 'Points Allowed (28-34)';
            } else if(teamScore >= 35) {
                DEFscore += (score?.pts_allow_35p || 0);
                DEFthreshold = 'score.pts_allow_35p';
                DEFdescription = 'Points Allowed (35+)';
            }
            return {DEFscore, DEFthreshold, DEFdescription};
        }
        // calculates FPTS due to DEF yards allowed
        const calculateDefYardsAllowed = (teamYards) => {
            let DEFscore = 0;
            let DEFthreshold;
            let DEFdescription;
            if(teamYards >= 0 && teamYards < 100) {
                DEFscore += (score?.yds_allow_0_100 || 0);
                DEFthreshold = 'yds_allow_0_100';
                DEFdescription = 'Yards Allowed (0-99)';
            } else if(teamYards >= 100 && teamYards < 200) {
                DEFscore += (score?.yds_allow_100_199 || 0);
                DEFthreshold = 'yds_allow_100_199';
                DEFdescription = 'Yards Allowed (100-199)';
            } else if(teamYards >= 200 && teamYards < 300) {
                DEFscore += (score?.yds_allow_200_299 || 0);
                DEFthreshold = 'yds_allow_200_299';
                DEFdescription = 'Yards Allowed (200-299)';
            } else if(teamYards >= 300 && teamYards < 350) {
                DEFscore += (score?.yds_allow_300_349 || 0);
                DEFthreshold = 'yds_allow_300_349';
                DEFdescription = 'Yards Allowed (300-349)';
            } else if(teamYards >= 350 && teamYards < 400) {
                DEFscore += (score?.yds_allow_350_399 || 0);
                DEFthreshold = 'yds_allow_350_399';
                DEFdescription = 'Yards Allowed (350-399)';
            } else if(teamYards >= 400 && teamYards < 450) {
                DEFscore += (score?.yds_allow_400_449 || 0);
                DEFthreshold = 'yds_allow_400_449';
                DEFdescription = 'Yards Allowed (400-449)';
            } else if(teamYards >= 450 && teamYards < 500) {
                DEFscore += (score?.yds_allow_450_499 || 0);
                DEFthreshold = 'yds_allow_450_499';
                DEFdescription = 'Yards Allowed (450-499)';
            } else if(teamYards >= 500 && teamYards < 550) {
                DEFscore += (score?.yds_allow_500_549 || 0);
                DEFthreshold = 'yds_allow_500_549';
                DEFdescription = 'Yards Allowed (500-549)';
            } else if(teamYards >= 550) {
                DEFscore += (score?.yds_allow_550p || 0);
                DEFthreshold = 'yds_allow_550p';
                DEFdescription = 'Yards Allowed (550+)';
            }
            if(score.yds_allow) {
                DEFscore += teamYards * score.yds_allow;
                DEFdescription = `Yards Allowed (${teamYards.toString()})`;
            } 
            return {DEFscore, DEFthreshold, DEFdescription};
        }
        // processes plays and calculates FPTS
        const processPlays = (playArray, defYardsArray, homeDefStarted, awayDefStarted, homeTeam, awayTeam, homeDefense, awayDefense, homeDefPtsAllowed, awayDefPtsAllowed, gameState, relevantStartersArray) => {
            let processedPlays = [];
            let fantasyPlay = {};
            bonusTracker = {};
            for(const playKey in playArray) {
                const play = playArray[playKey];
                // create play-array to group fpts by multiple players in one play
                if(!fantasyPlay[play.playID]) fantasyPlay[play.playID] = [];

                let fumbleInfo;
                if((play.description.includes('FUMBLES') || play.description.includes('MUFFS'))) {
                    fumbleInfo = processFumble(play, play.relevantPlayers);
                }

                // INJURY PLAYS
                if(play.injuredStarter == true) {
                    const entry = {
                        order: play.order,
                        side: 'injury',
                        manager: play.injuryInfo[0].owner,
                        playerInfo: play.injuryInfo[0],
                        description: play.description,
                        shortDesc: 'Injury',
                    }
                    fantasyPlay[play.playID].push(entry);
                }
                // TO-DO: other non-defensive-score-hurting touchdowns                                      TEAM DEF POINTS ALLOWED
                if(defenseEnabled == true && (play.scoreAgainstOppDEF == true || play.scoreAgainstDEF == true) && (homeDefStarted == true || awayDefStarted == true)) {
                    if(play.team == homeTeam) {
                        if(play.scoreAgainstDEF == true && awayDefStarted == true) {
                            let oldAwayDefPtsAllowed = awayDefPtsAllowed - play.scoreValueAgainstDEF;
                            let curDEFscore = calculateDefPointsAllowed(awayDefPtsAllowed);
                            let oldDEFscore = calculateDefPointsAllowed(oldAwayDefPtsAllowed);
                            const fpts = curDEFscore.DEFscore - oldDEFscore.DEFscore;
                            if(fpts != 0) {
                                fantasyPlay[play.playID].push({
                                    order: play.order,
                                    side: 'defense',
                                    manager: awayDefense.owner,
                                    playerInfo: awayDefense,
                                    fpts,
                                    description: play.description,
                                    shortDesc: curDEFscore.DEFdescription,
                                    bonus: false,
                                    bonusDesc: [],
                                });
                            }
                            awayDefPtsAllowed = oldAwayDefPtsAllowed;
                        } else if(play.scoreAgainstOppDEF == true && homeDefStarted == true) {
                            let oldHomeDefPtsAllowed = homeDefPtsAllowed - play.scoreValueAgainstOppDEF;
                            let curDEFscore = calculateDefPointsAllowed(homeDefPtsAllowed);
                            let oldDEFscore = calculateDefPointsAllowed(oldHomeDefPtsAllowed);
                            const fpts = curDEFscore.DEFscore - oldDEFscore.DEFscore;
                            if(fpts != 0) {
                                fantasyPlay[play.playID].push({
                                    order: play.order,
                                    side: 'defense',
                                    manager: homeDefense.owner,
                                    playerInfo: homeDefense,
                                    fpts,
                                    description: play.description,
                                    shortDesc: curDEFscore.DEFdescription,
                                    bonus: false,
                                    bonusDesc: [],
                                });
                            }
                            homeDefPtsAllowed = oldHomeDefPtsAllowed;     
                        }
                    } else if(play.team == awayTeam) {
                        if(play.scoreAgainstDEF == true && homeDefStarted == true) {
                            let oldHomeDefPtsAllowed = homeDefPtsAllowed - play.scoreValueAgainstDEF;
                            let curDEFscore = calculateDefPointsAllowed(homeDefPtsAllowed);
                            let oldDEFscore = calculateDefPointsAllowed(oldHomeDefPtsAllowed);
                            const fpts = curDEFscore.DEFscore - oldDEFscore.DEFscore;
                            if(fpts != 0) {
                                fantasyPlay[play.playID].push({
                                    order: play.order,
                                    side: 'defense',
                                    manager: homeDefense.owner,
                                    playerInfo: homeDefense,
                                    fpts,
                                    description: play.description,
                                    shortDesc: curDEFscore.DEFdescription,
                                    bonus: false,
                                    bonusDesc: [],
                                });
                            }
                            homeDefPtsAllowed = oldHomeDefPtsAllowed;     
                        } else if(play.scoreAgainstOppDEF == true && awayDefStarted == true) {
                            let oldAwayDefPtsAllowed = awayDefPtsAllowed - play.scoreValueAgainstOppDEF;
                            let curDEFscore = calculateDefPointsAllowed(awayDefPtsAllowed);
                            let oldDEFscore = calculateDefPointsAllowed(oldAwayDefPtsAllowed);
                            const fpts = curDEFscore.DEFscore - oldDEFscore.DEFscore;
                            if(fpts != 0) {
                                fantasyPlay[play.playID].push({
                                    order: play.order,
                                    side: 'defense',
                                    manager: awayDefense.owner,
                                    playerInfo: awayDefense,
                                    fpts,
                                    description: play.description,
                                    shortDesc: curDEFscore.DEFdescription,
                                    bonus: false,
                                    bonusDesc: [],
                                });
                            }
                            awayDefPtsAllowed = oldAwayDefPtsAllowed;
                        }
                    }
                }
                if(defenseEnabled == true && play.relevantDEF.length > 0) {                   // TEAM DEF/ST FPTS
                    let sackRecorded = false;
                    for(const relevantKey in play.relevantDEF) {
                        const player = play.relevantDEF[relevantKey];
                        let fumblerTeam;
                        if(player.statType == 'fumbler') {
                            fumblerTeam = player.playerInfo.t;
                        //     else if(player.playType == 52 && fumbleInfo && player.statType == 'punter') {
                        //     if(fumbleInfo.turnover == true && score.fum_lost) {
                        //         const fpts = (score?.ff || 0); 
                        //             const stat = 'FF(D):';
                        //             const entryDEF = {
                        //                 order: play.order,
                        //                 side: 'defense',
                        //                 manager: player.manager,
                        //                 playerInfo: player.playerInfo,
                        //                 stat: ['ff'],
                        //                 runningTotals: [],
                        //                 fpts,
                        //                 description: play.description,
                        //                 shortDesc: 'Forced Fumble',
                        //             }
                        //             if(fpts != 0) {
                        //                 let runningTotal = pushRunningTotal(fpts, stat, entryDEF.stat[0], 1, player.playerInfo.playerID, player.playerInfo.pos); 
                        //                 entryDEF.runningTotals.push(runningTotal);
                        //             }
                        //             fantasyPlay[play.playID].push(entryDEF);
                        //     }
                        // }
                        } else if(player.playType == 20) {                                                              // SAFETY - TEAM DEF
                            if(player.statType == 'sackedBy') {                     // TO-DO assisted and solo tackles
                                const fpts = (score?.sack || 0) + player.yards * (score?.sack_yd || 0) + (score?.qb_hit || 0) + (score?.tkl || 0) + (score?.tkl_loss || 0);
                                const entryDEF = {
                                    order: play.order,
                                    side: 'defense',
                                    manager: player.manager,
                                    playerInfo: player.playerInfo,
                                    fpts,
                                    yards: player.yards,
                                    description: play.description,
                                    shortDesc: 'Sack',
                                    bonus: false, 
                                    bonusDesc: [],
                                }
                                fantasyPlay[play.playID].push(entryDEF);
                                sackRecorded = true;       // so that split-sacks aren't counted twice
                            } else if(player.statType == 'scorer' && score.safe) {
                                fantasyPlay[play.playID].push({
                                    order: play.order,
                                    side: 'defense',
                                    manager: player.manager,
                                    playerInfo: player.playerInfo,
                                    fpts: score.safe,
                                    description: play.description,
                                    shortDesc: 'Safety',
                                    bonus: false, 
                                    bonusDesc: [], 
                                });
                            } 
                        } else if(player.statType == 'scorer' && player.playType == 39 && score.def_td) {                       // FUMBLE 6 - TEAM DEF
                            fantasyPlay[play.playID].push({
                                order: play.order,
                                side: 'defense',
                                manager: player.manager,
                                playerInfo: player.playerInfo,
                                fpts: score.def_td,
                                description: play.description,
                                shortDesc: 'Fumble 6',
                                bonus: false, 
                                bonusDesc: [],  
                            });
                        } else if(player.statType == 'recoverer'
                                && (player.playType != 17 || (player.playType == 17 && fumblerTeam != null && fumblerTeam != player.playerInfo.t))
                                && (player.playType != 37 || (player.playType == 37 && fumblerTeam != null && fumblerTeam != player.playerInfo.t))
                                && player.playType != 9
                                && (player.playerInfo.t != fumblerTeam || player.playType == 29 || player.playType == 39)
                                && (score.def_st_fum_rec || score.fum_rec || score.fum_ret_yd)) {                    
                                    if(score.def_st_fum_rec && (player.playType == 52 || player.playType == 12 || player.playType == 60 || player.playType == 17 || player.playType == 37 || player.playType == 32)) {       // FUMBLE RECOVERY PTS - SPECIAL TEAM
                                        fantasyPlay[play.playID].push({
                                            order: play.order,
                                            side: 'defense',
                                            manager: player.manager,
                                            playerInfo: player.playerInfo,
                                            fpts: score.def_st_fum_rec,
                                            description: play.description,
                                            shortDesc: 'Fumble Recovery (ST)',
                                            bonus: false, 
                                            bonusDesc: [],  
                                        }   );
                                    } else if(score.fum_rec || score.fum_ret_yd) {                                                                    // FUMBLE RECOVERY PTS - TEAM DEF
                                        const fpts = (score?.fum_rec || 0) + player.yards * (score?.fum_ret_yd || 0);            // NOTE TO-DO: May need to rethink how TEAM DEF pts scored for this
                                        const entryDEF = {
                                            order: play.order,
                                            side: 'defense',
                                            manager: player.manager,
                                            playerInfo: player.playerInfo,
                                            fpts,
                                            yards: player.yards,
                                            description: play.description,
                                            shortDesc: 'Fumble Recovery (DEF)',
                                            bonus: false, 
                                            bonusDesc: [],
                                        }   
                                        fantasyPlay[play.playID].push(entryDEF);
                                    }
                        } else if(player.statType == 'forcedBy' && (score.ff || score.def_st_ff)) {          // FORCED FUMBLE PTS - TEAM ST
                            if(score.def_st_ff && (player.playType == 52 || player.playType == 12 || player.playType == 60 || player.playType == 17 || player.playType == 37 || player.playType == 32)) {
                                fantasyPlay[play.playID].push({
                                    order: play.order,
                                    side: 'defense',
                                    manager: player.manager,
                                    playerInfo: player.playerInfo,
                                    fpts: score.def_st_ff,
                                    description: play.description,
                                    shortDesc: 'Forced Fumble (ST)',
                                    bonus: false, 
                                    bonusDesc: [],
                                });
                            } else if(score.ff) {                            // FORCED FUMBLE PTS - TEAM DEF
                                fantasyPlay[play.playID].push({
                                    order: play.order,
                                    side: 'defense',
                                    manager: player.manager,
                                    playerInfo: player.playerInfo,
                                    fpts: score.ff,
                                    description: play.description,
                                    shortDesc: 'Forced Fumble (DEF)',
                                    bonus: false, 
                                    bonusDesc: [],
                                });
                            }
                        } else if(player.statType == 'sackedBy' && sackRecorded == false) {            // SACK - TEAM DEF TO-DO: account for assisted tackles and solo tackles
                            const fpts = (score?.sack || 0) + player.yards * (score?.sack_yd || 0) + (score?.qb_hit || 0) + (score?.tkl || 0) + (score?.tkl_loss || 0);
                            const entryDEF = {
                                order: play.order,
                                side: 'defense',
                                manager: player.manager,
                                playerInfo: player.playerInfo,
                                fpts,
                                yards: player.yards,
                                description: play.description,
                                shortDesc: 'Sack',
                                bonus: false, 
                                bonusDesc: [],
                            }
                            fantasyPlay[play.playID].push(entryDEF);
                            sackRecorded = true;       // so that split-sacks aren't counted twice
                        } else if(player.playType == 36 && player.statType == 'scorer') {        // P6 TEAM DEF
                            const fpts = (score?.def_td || 0) + (score?.int || 0) + player.yards * (score?.int_ret_yd || 0);
                            const entryDEF = {
                                order: play.order,
                                side: 'defense',
                                manager: player.manager,
                                playerInfo: player.playerInfo,
                                fpts,
                                yards: player.yards,
                                description: play.description,
                                shortDesc: 'Pick Six',
                                bonus: false,
                                bonusDesc: [],
                            }
                            fantasyPlay[play.playID].push(entryDEF);
                        } else if(player.statType == 'passDefender' && score.def_pass_def) {                     // PASS DEFENSE - DEF
                            fantasyPlay[play.playID].push({
                                order: play.order,
                                side: 'defense',
                                manager: player.manager,
                                playerInfo: player.playerInfo,
                                fpts: score.def_pass_def,
                                description: play.description,
                                shortDesc: 'Defended Pass',
                                bonus: false,
                                bonusDesc: [],
                            });
                        } else if(player.statType == 'returner') {                  // KICKOFF RETURN YDS TEAM DEF/ST
                            if(player.playType == 12 && score.def_kr_yd) {
                                const fpts = player.yards * score.def_kr_yd;
                                const entryDEF = {
                                    order: play.order,
                                    side: 'defense',
                                    manager: player.manager,
                                    playerInfo: player.playerInfo,
                                    fpts,
                                    yards: player.yards,
                                    description: play.description,
                                    shortDesc: 'Kickoff Return',
                                    bonus: false, 
                                    bonusDesc: [],
                                }
                                fantasyPlay[play.playID].push(entryDEF);
                            } else if(player.playType == 52 && (score.def_pr_yd || score.def_forced_punts)) {                  // PUNT - TEAM DEF/ST
                                if(score.def_pr_yd) {                                                                               // PUNT RETURN YDS - TEAM DEF/ST
                                    let adjustedYards = player.yards;
                                    if(play.penalty == true) {
                                        adjustedYards = play.penaltyInfo.trueYards;
                                    }
                                    const fpts = adjustedYards * score.def_pr_yd;
                                    const entryDEF = {
                                        order: play.order,
                                        side: 'defense',
                                        manager: player.manager,
                                        playerInfo: player.playerInfo,
                                        fpts,
                                        yards: adjustedYards,
                                        description: play.description,
                                        shortDesc: 'Punt Return',
                                        bonus: false, 
                                        bonusDesc: [],
                                    }
                                    fantasyPlay[play.playID].push(entryDEF);
                                }
                                if(score.def_forced_punts) {                                                                    // FORCED PUNT - TEAM DEF
                                    fantasyPlay[play.playID].push({
                                        order: play.order,
                                        side: 'defense',
                                        manager: player.manager,
                                        playerInfo: player.playerInfo,
                                        fpts: score.def_forced_punts,
                                        description: play.description,
                                        shortDesc: 'Forced Punt',
                                        bonus: false, 
                                        bonusDesc: [],
                                    });
                                }
                            } else if(player.playType == 32 && (score.def_kr_yd || score.def_st_td)) {                  // KICK 6 - TEAM DEF/ST
                                const fpts = player.yards * (score?.def_kr_yd || 0) + (score?.def_st_td || 0);
                                const entryDEF = {
                                    order: play.order,
                                    side: 'defense',
                                    manager: player.manager,
                                    playerInfo: player.playerInfo,
                                    fpts,
                                    yards: player.yards,
                                    description: play.description,
                                    shortDesc: 'Kick Six',
                                    bonus: false,
                                    bonusDesc: [],
                                }
                                fantasyPlay[play.playID].push(entryDEF);
                            } else if(player.playType == 26 && (score.int || score.int_ret_yd)) {                      // INT TEAM DEF
                                const fpts = (score?.int || 0) + player.yards * (score?.int_ret_yd || 0);
                                const entryDEF = {
                                    order: play.order,
                                    side: 'defense',
                                    manager: player.manager,
                                    playerInfo: player.playerInfo,
                                    fpts,
                                    yards: player.yards,
                                    description: play.description,
                                    shortDesc: 'Interception',
                                    bonus: false,
                                    bonusDesc: [],
                                }
                                fantasyPlay[play.playID].push(entryDEF);
                            }
                        } else if(score.def_2pt && play.playType == 57 && player.statType == 'scorer') {                                                                       // DEF 2-PT CONVERSION
                            const entryDEF = {
                                order: play.order,
                                side: 'defense',
                                manager: player.manager,
                                playerInfo: player.playerInfo,
                                fpts: score.def_2pt,
                                yards: player.yards,
                                description: play.description,
                                shortDesc: 'Def. 2-PT Conversion',
                                bonus: false,
                                bonusDesc: [],
                            }
                            if(play.description.includes('Blocked')) {
                                entryDEF.shortDesc = 'Blocked PAT -> Def. 2-PT Conversion';
                            }
                            fantasyPlay[play.playID].push(entryDEF);     
                        } else if(player.statType == 'tackler' && player.playType != 26 && player.playType != 29 && (score.tkl || score.tkl_solo || score.tkl_loss || score.def_st_tkl_solo)) { 
                            if(score.def_st_tkl_solo && (player.playType == 52 || player.playType == 12)) {                                    // SOLO-TACKLES = TEAM ST
                                fantasyPlay[play.playID].push({
                                    order: play.order,
                                    side: 'defense',
                                    manager: player.manager,
                                    playerInfo: player.playerInfo,
                                    fpts: score.def_st_tkl_solo,
                                    description: play.description,
                                    shortDesc: 'Solo Tackle (ST)',
                                    bonus: false, 
                                    bonusDesc: [],
                                })
                            } else if(score.tkl || score.tkl_solo || score.tkl_loss) {
                                const fpts = (score?.tkl || 0) + (score?.tkl_solo || 0) + (score.tkl_loss && player.yards < 0 ? score.tkl_loss : 0);
                                const entryDEF = {                                                                  // SOLO TACKLES - TEAM DEF
                                    order: play.order,
                                    side: 'defense',
                                    manager: player.manager,
                                    playerInfo: player.playerInfo,
                                    fpts,
                                    description: play.description,
                                    shortDesc: 'Solo Tackle (DEF)',
                                    bonus: false, 
                                    bonusDesc: [],
                                } 
                                if(player.yards < 0) {
                                    entryDEF.shortDesc += ' for Loss';
                                }                                
                                fantasyPlay[play.playID].push(entryDEF); 
                            }
                        } else if(player.statType == 'assistedBy' && player.playType != 26 && player.playType != 29 && player.playType != 52 && player.playType != 12 && (score.tkl || score.tkl_ast || score.tkl_loss)) { 
                            const fpts = (score?.tkl || 0) + (score?.tkl_ast || 0) + (score.tkl_loss && player.yards < 0 ? score.tkl_loss : 0);
                            const entryDEF = {                                                                  // ASSISTED TACKLES - TEAM DEF
                                order: play.order,
                                side: 'defense',
                                manager: player.manager,
                                playerInfo: player.playerInfo,
                                fpts,
                                description: play.description,
                                shortDesc: 'Assisted Tackle (DEF)',
                                bonus: false, 
                                bonusDesc: [],
                            } 
                            if(player.yards < 0) {
                                entryDEF.shortDesc = 'Assisted Tackle for Loss (DEF)';
                            }                                
                            fantasyPlay[play.playID].push(entryDEF);      
                        } else if(score.blk_kick && (play.pointAfterType == 43 || play.pointAfterType == 0)) {                                                    // BLOCKED PAT - TEAM DEF/ST
                            fantasyPlay[play.playID].push({
                                order: play.order,
                                side: 'defense',
                                manager: player.manager,
                                playerInfo: player.playerInfo,
                                fpts: score.blk_kick,
                                yards: player.yards,
                                description: play.description,
                                shortDesc: 'Blocked PAT',
                                bonus: false,
                                bonusDesc: [],
                            });
                        } else if(score.blk_kick && (player.playType == 18 || (player.playType == 60 && play.description.includes('BLOCKED'))) && player.statType == 'blocker') {                  // BLOCKED FIELD GOAL - TEAM DEF/ST
                            const fpts = (score?.blk_kick || 0);   // TO-DO: add blk kick return yards (ESPN's statYardage norrmally represents kick distance) 
                            const entryDEF = {
                                order: play.order,
                                side: 'defense',
                                manager: player.manager,
                                playerInfo: player.playerInfo,
                                fpts,
                                yards: player.yards,
                                description: play.description,
                                shortDesc: 'Blocked Field Goal',
                                bonus: false, 
                                bonusDesc: [],
                            }
                            fantasyPlay[play.playID].push(entryDEF);
                        } else if((player.playType == 37 || player.playType == 17) && (player.statType == 'blocker' || player.statType == 'scorer') && (score.blk_kick || score.blk_kick_ret_yd || score.def_st_td)) {      
                            const entryDEF = {
                                order: play.order,
                                side: 'defense',
                                manager: player.manager,
                                playerInfo: player.playerInfo,
                                fpts: 0,
                                yards: player.yards,
                                description: play.description,
                                shortDesc: 'Blocked Punt',
                                bonus: false, 
                                bonusDesc: [],
                            }
                            if(player.statType == 'blocker' && (score.blk_kick || score.blk_kick_ret_yd)) {
                                entryDEF.fpts += (score?.blk_kick || 0) + player.yards * (score?.blk_kick_ret_yd || 0);                                     // BLOCKED PUNT + RETURN - TEAM ST
                            } else if(player.statType == 'scorer' && score.def_st_td && play.scoringPlay == true) {                                                        // BLOCKED PUNT + TD - TEAM ST
                                entryDEF.fpts += score.def_st_td;
                                entryDEF.shortDesc = 'Blocked Punt -> Touchdown';
                            }
                            fantasyPlay[play.playID].push(entryDEF);
                        } else if(player.playType == '4thdown') {                                                                                                   // TEAM DEF - 4TH DOWN STOP
                            fantasyPlay[play.playID].push({
                                order: play.order,
                                side: 'defense',
                                manager: player.manager,
                                playerInfo: player.playerInfo,
                                fpts: score.def_4_and_stop,
                                description: play.description,
                                shortDesc: 'Turnover on Downs',
                                bonus: false, 
                                bonusDesc: [],
                            });
                        } else if(player.playType == '3andout') {                                                                                           // TEAM DEF - 3 AND OUT
                            pushRunningTotal(score.def_3_and_out, statDescriptions['def_3_and_out'], Object.keys(statDescriptions['def_3_and_out']), 1, player.playerInfo.playerID, player.playerInfo.pos);
                            fantasyPlay[play.playID].push({
                                order: play.order,
                                side: 'defense',
                                manager: player.manager,
                                playerInfo: player.playerInfo,
                                fpts: score.def_3_and_out,
                                description: play.description,
                                shortDesc: 'Forced Turnover on Downs',
                                bonus: false, 
                                bonusDesc: [],
                            });
                        }
                    }
                }

                if(play.relevantPlayers.length > 0) {                   // OFFENSIVE & ST-PLAYER FPTS 
                    for(const relevantKey in play.relevantPlayers) {
                        const player = play.relevantPlayers[relevantKey];       
                        if(player.statType == 'fumbler' && (score.fum || score.fum_lost)) {                  // FUMBLE 
                            const entry = {
                                order: play.order,
                                side: 'offense',
                                manager: player.manager,
                                playerInfo: player.playerInfo,
                                fpts: score?.fum || 0,
                                yards: player.yards,
                                description: play.description,
                                shortDesc: 'Fumble',
                                bonus: false,
                                bonusDesc: [],
                            }                 
                            if(score.fum_lost && player.playType == 29 || player.playType == 39 || (player.playType != 9 && !play.description.includes(`recovered by ${player.playerTeam}`) && !play.description.includes(`and recovers`) && !play.description.includes(`ball out of bounds`))) {      // NEGATIVE POINTS for FUMBLE -> TURNOVER
                                entry.fpts += score.fum_lost; 
                                entry.shortDesc += ' -> Turnover';
                            }
                            fantasyPlay[play.playID].push(entry);
                        } else if(score.st_fum_rec && player.statType == 'recoverer' && (player.playType == 52 || player.playType == 12)) {                
                            fantasyPlay[play.playID].push({                                                     // FUMBLE RECOVERY - ST PLAYER
                                order: play.order,
                                side: 'offense',
                                manager: player.manager,
                                playerInfo: player.playerInfo,
                                fpts: score.st_fum_rec,
                                description: play.description,
                                shortDesc: 'Fumble Recovery',
                                bonus: false, 
                                bonusDesc: [],
                            });
                        } else if(score.st_ff && player.statType == 'forcedBy' && (player.playType == 52 || player.playType == 12)) {      // FUMBLE FORCED PTS - ST PLAYER
                            fantasyPlay[play.playID].push({
                                order: play.order,
                                side: 'offense',
                                manager: player.manager,
                                playerInfo: player.playerInfo,
                                fpts: score.st_ff,
                                description: play.description,
                                shortDesc: 'Forced Fumble',
                                bonus: false, 
                                bonusDesc: [],
                            });
                        } else if(score.st_tkl_solo && player.statType == 'tackler') {                                   // SOLO TACKLES - ST PLAYER
                            fantasyPlay[play.playID].push({                                                                 
                                order: play.order,
                                side: 'offense',
                                manager: player.manager,
                                playerInfo: player.playerInfo,
                                fpts: score.st_tkl_solo,
                                description: play.description,
                                shortDesc: 'Solo Tackle (ST Player)',
                                bonus: false, 
                                bonusDesc: [],
                            }); 
                        }
                        if(play.pointAfterType == 15 && (score.rec_2pt || score.pass_2pt)) {                         // 2-PT CONVERSIONS
                            if(player.statType == 'patPasser' && score.pass_2pt) {                                                // 2-PT PASS
                                fantasyPlay[play.playID].push({
                                    order: play.order,
                                    side: 'offense',
                                    manager: player.manager,
                                    playerInfo: player.playerInfo,
                                    fpts: score.pass_2pt,
                                    description: play.description,
                                    shortDesc: '2-PT Conversion (Pass)',
                                    bonus: false, 
                                    bonusDesc: [],
                                });
                            } else if(player.statType == 'patScorer' && score.rec_2pt) {                             // 2-PT RECEPTION 
                                fantasyPlay[play.playID].push({
                                    order: play.order,
                                    side: 'offense',
                                    manager: player.manager,
                                    playerInfo: player.playerInfo,
                                    fpts: score.rec_2pt,
                                    description: play.description,
                                    shortDesc: '2-PT Conversion (Reception)',
                                    bonus: false, 
                                    bonusDesc: [],
                                });
                            }
                        } else if(play.pointAfterType == 16 && score.rush_2pt) {
                            if(player.statType == 'patScorer' && score.rush_2pt) {                             // 2-PT RUSH
                                fantasyPlay[play.playID].push({
                                    order: play.order,
                                    side: 'offense',
                                    manager: player.manager,
                                    playerInfo: player.playerInfo,
                                    fpts: score.rush_2pt,
                                    description: play.description,
                                    shortDesc: '2-PT Conversion (Rush)',
                                    bonus: false, 
                                    bonusDesc: [],
                                });
                            }
                        }
                        if((player.playType == 5 || player.playType == 9 || player.playType == 29 || player.playType == 39) && player.statType == 'rusher') {         // RUSH
                            let adjustedYards = player.yards;
                            if(play.penalty == true) {
                                adjustedYards = play.penaltyInfo.trueYards;
                            }
                            const fpts = adjustedYards * (score?.rush_yd || 0) + (score?.rush_att || 0) + (adjustedYards >= 40 && score.rush_40p ? score.rush_40p : 0) ;
                            const entry = {
                                order: play.order,
                                side: 'offense',
                                manager: player.manager,
                                playerInfo: player.playerInfo,
                                fpts,
                                yards: adjustedYards,
                                description: play.description,
                                shortDesc: 'Rush',
                                bonus: false,
                                bonusDesc: [],
                            }
                            if(adjustedYards >= 40 && score.rush_40p) {          // RUSH YD BONUS
                                entry.bonus = true;
                                entry.bonusDesc.push('40+ YARD RUSH');
                            }
                            if(score.bonus_rush_att_20 || score.bonus_rush_yd_100 || score.bonus_rush_yd_200 || score.bonus_rush_rec_yd_100 || score.bonus_rush_rec_yd_200) {
                                const rushingBonusInfo = processBonus(adjustedYards, player, 'rushing', null);
                                if(rushingBonusInfo.bonus == true) {
                                    entry.bonus = true;
                                    entry.fpts += rushingBonusInfo.fpts;
                                    for(const bonus of rushingBonusInfo.bonusDesc) {
                                        entry.bonusDesc.push(bonus);
                                    }
                                }
                            }
                            fantasyPlay[play.playID].push(entry);
                        } else if(player.playType == 68 && player.statType == 'rusher') {            // RUSH TD  NOTE TO-DO: ACCOUNT FOR LATERALS (SAME WITH REC TDs)
                            const fpts = player.yards * (score?.rush_yd || 0) + (score?.rush_att || 0) + (score?.rush_td || 0) + (40 <= player.yards && player.yards < 50 && score.rush_td_40p ? score.rush_td_40p : 0) 
                                        + (player.yards >= 40 && score.rush_40p ? score.rush_40p : 0) + (player.yards >= 50 && score.rush_td_50p ? score.rush_td_50p : 0);
                            const entry = {
                                order: play.order,
                                side: 'offense',
                                manager: player.manager,
                                playerInfo: player.playerInfo,
                                fpts,
                                yards: player.yards,
                                description: play.description,
                                shortDesc: 'Rushing Touchdown',
                                bonus: false,
                                bonusDesc: [],
                            }
                            if(40 <= player.yards && (score.rush_td_40p || score.rush_40p)) {          // RUSH TD YD BONUS
                                entry.bonus = true;
                                if(score.rush_td_40p) {
                                    entry.bonusDesc.push('40+ YARD RUSHING TD');
                                }
                                if(score.rush_40p) {
                                    entry.bonusDesc.push('40+ YARD RUSH');
                                }
                                
                            } else if(player.yards >= 50 && score.rush_td_50p) {
                                entry.bonus = true;
                                entry.bonusDesc.push('50+ YARD RUSHING TD');
                            }
                            if(score.bonus_rush_att_20 || score.bonus_rush_yd_100 || score.bonus_rush_yd_200 || score.bonus_rush_rec_yd_100 || score.bonus_rush_rec_yd_200) {
                                const rushingBonusInfo = processBonus(player.yards, player, 'rushing', null);
                                if(rushingBonusInfo.bonus == true) {
                                    entry.bonus = true;
                                    entry.fpts += rushingBonusInfo.fpts;
                                    for(const bonus of rushingBonusInfo.bonusDesc) {
                                        entry.bonusDesc.push(bonus);
                                    }
                                }
                            }
                            fantasyPlay[play.playID].push(entry);
                        } else if(player.playType == 26 && player.statType == 'passer' && (score.pass_int || score.pass_att || score.pass_inc)) {          // INTERCEPTION - QB PENALTY
                            const fpts = (score?.pass_int || 0) + (score?.pass_att || 0) + (score?.pass_inc || 0);;
                            const entry = {
                                order: play.order,
                                side: 'offense',
                                manager: player.manager,
                                playerInfo: player.playerInfo,
                                fpts,
                                description: play.description,
                                shortDesc: 'Interception Thrown',
                                bonus: false,
                                bonusDesc: [],
                            }  
                            fantasyPlay[play.playID].push(entry);
                            
                        } else if(player.playType == 36 && player.statType != 'passer' && (score.pass_int || score.pass_int_td || score.pass_att || score.pass_inc)) {            // PICK SIX - QB PENALTY
                            const fpts = (score?.pass_int || 0) + (score?.pass_inc || 0) + (score?.pass_int_td || 0) + (score?.pass_att || 0);
                            const entry = {
                                order: play.order,
                                side: 'offense',
                                manager: player.manager,
                                playerInfo: player.playerInfo,
                                fpts,
                                description: play.description,
                                shortDesc: 'Pick Six Thrown',
                                bonus: false,
                                bonusDesc: [],
                            }  
                            fantasyPlay[play.playID].push(entry);
                        } else if((player.statType == 'passer' || player.statType == 'receiver') 
                            && (player.playType == 24 || player.playType == 9 || player.playType == 29 || player.playType == 39)) {          // COMPLETE PASS
                                if(player.statType == 'passer') {
                                    let adjustedYards = player.yards;
                                    if(play.penalty == true) {
                                        adjustedYards = play.penaltyInfo.trueYards;
                                    }
                                    const fpts = adjustedYards * (score?.pass_yd || 0) + (score?.pass_att || 0) + (score?.pass_cmp || 0) + (adjustedYards >= 40 && score.pass_cmp_40p ? score.pass_cmp_40p : 0);
                                    const entry = {
                                        order: play.order,
                                        side: 'offense',
                                        manager: player.manager,
                                        playerInfo: player.playerInfo,
                                        fpts,
                                        yards: adjustedYards,
                                        description: play.description,
                                        shortDesc: 'Pass Complete',
                                        bonus: false,
                                        bonusDesc: [],
                                    }   
                                    if(score.pass_cmp_40p && adjustedYards >= 40) {
                                        entry.bonus = true;
                                        entry.bonusDesc.push('40+ YARD COMPLETION')
                                    }
                                    if(score.bonus_pass_yd_300 || score.bonus_pass_yd_400 || score.bonus_pass_cmp_25) {
                                        const passingBonusInfo = processBonus(adjustedYards, player, 'passing', null);
                                        if(passingBonusInfo.bonus == true) {
                                            entry.fpts += passingBonusInfo.fpts;
                                            entry.bonus = true;
                                            for(const bonus of passingBonusInfo.bonusDesc) {
                                                entry.bonusDesc.push(bonus);
                                            }
                                        }
                                    }
                                    fantasyPlay[play.playID].push(entry);
                                } else if(player.statType == 'receiver') {                              // RECEPTION
                                    let adjustedYards = player.yards;
                                    if(play.penalty == true) {
                                        adjustedYards = play.penaltyInfo.trueYards;
                                    }

                                    if(play.description.includes('Lateral')) {            // TO-DO fix this 
                                        let lateralInfo = processLateral(play, player, relevantStartersArray); 
                                        adjustedYards = lateralInfo.find(p => p.player == player).yards;
                                        // scoring the original receiver
                                        if(lateralInfo.find(p => p.player != player)) {                                          
                                            let firstPlayer = lateralInfo.find(p => p.player != player);
                                            let firstPlayerYards = firstPlayer.yards;
                                            const fpts = firstPlayerYards * (score?.rec_yd || 0) + (score?.rec || 0);
                                            const entry = {
                                                order: play.order,
                                                side: 'offense',
                                                manager: firstPlayer.player.manager,
                                                playerInfo: firstPlayer.player.playerInfo,
                                                fpts,
                                                yards: firstPlayerYards,
                                                description: play.description,
                                                shortDesc: 'Reception',
                                                bonus: false, 
                                                bonusDesc: [],
                                            }
                                            if(firstPlayerYards > 0) {
                                                const receptionBonusInfo = processBonus(firstPlayerYards, firstPlayer.player, 'receiving', 'reception');
                                                entry.fpts += receptionBonusInfo.fpts;
                                                if(receptionBonusInfo.bonus == true) {
                                                    entry.bonus = true;
                                                    for(const bonus of receptionBonusInfo.bonusDesc) {
                                                        entry.bonusDesc.push(bonus);
                                                    }
                                                }
                                            }
                                            fantasyPlay[play.playID].push(entry);

                                            let lateralPlayers = lateralInfo.filter(p => p.player != player).shift();
                                            if(lateralPlayers.length > 0) {
                                                for(const lateralPlayer in lateralPlayers) {
                                                    const lateralee = lateralPlayers[lateralPlayer];
                                                    const latFpts = lateralee.yards * (score?.rec_yd || 0);
                                                    const lateraleeEntry = {
                                                        order: play.order,
                                                        side: 'offense',
                                                        manager: lateralee.player.manager,
                                                        playerInfo: lateralee.player.playerInfo,
                                                        fpts: latFpts,
                                                        yards: lateraleeYards,
                                                        description: play.description,
                                                        shortDesc: 'Receiving Yards After Lateral',
                                                        bonus: false, 
                                                        bonusDesc: [],
                                                    }
                                                    const receptionBonusInfo = processBonus(adjustedYards, player, 'receiving', null);
                                                    lateraleeEntry.fpts += receptionBonusInfo.fpts;
                                                    if(receptionBonusInfo.bonus == true) {
                                                        lateraleeEntry.bonus = true;
                                                        for(const bonus of receptionBonusInfo.bonusDesc) {
                                                            lateraleeEntry.bonusDesc.push(bonus);
                                                        }
                                                    }
                                                    fantasyPlay[play.playID].push(lateraleeEntry);
                                                }
                                            }

                                        }
                                    }
                                    
                                    let fpts = adjustedYards * (score?.rec_yd || 0) + (score?.rec || 0);
                                    let entry = {
                                        order: play.order,
                                        side: 'offense',
                                        manager: player.manager,
                                        playerInfo: player.playerInfo,
                                        fpts: fpts,
                                        yards: adjustedYards,
                                        description: play.description,
                                        shortDesc: 'Reception',
                                        bonus: false,
                                        bonusDesc: [],
                                    }
                                    if(play.description.includes('Lateral')) {
                                        entry.fpts = adjustedYards * (score?.rec_yd || 0);
                                        entry.shortDesc = 'Pass Yards After Lateral';
                                        const receptionBonusInfo = processBonus(adjustedYards, player, 'receiving', 'reception');
                                        entry.fpts += receptionBonusInfo.fpts;
                                        if(receptionBonusInfo.bonus == true) {
                                            entry.bonus = true;
                                            for(const bonus of receptionBonusInfo.bonusDesc) {
                                                entry.bonusDesc.push(bonus);
                                            }
                                        }
                                    } else {
                                        const receptionBonusInfo = processBonus(adjustedYards, player, 'receiving', null);
                                        entry.fpts += receptionBonusInfo.fpts;
                                        if(receptionBonusInfo.bonus == true) {
                                            entry.bonus = true;
                                            for(const bonus of receptionBonusInfo.bonusDesc) {
                                                entry.bonusDesc.push(bonus);
                                            }
                                        }
                                    }
                                    fantasyPlay[play.playID].push(entry);
                                }         
                        } else if(player.playType == 67 && (player.statType == 'passer' || player.statType == 'receiver')) {                         // PASSING TD
                            if(player.statType == 'passer') {
                                const fpts = player.yards * (score?.pass_yd || 0) + (score?.pass_td || 0) + (score?.pass_cmp || 0) + (score?.pass_att || 0) + (40 <= player.yards && score.pass_cmp_40p ? score.pass_cmp_40p : 0) + (40 <= player.yards && score.pass_td_40p ? score.pass_td_40p : 0) + (player.yards >= 50 && score.pass_td_50p ? score.pass_td_50p : 0);
                                const entry = {
                                    order: play.order,
                                    side: 'offense',
                                    manager: player.manager,
                                    playerInfo: player.playerInfo,
                                    fpts,
                                    yards: player.yards,
                                    description: play.description,
                                    shortDesc: 'Passing Touchdown',
                                    bonus: false, 
                                    bonusDesc: [],
                                }
                                if(40 <= player.yards && (score.pass_cmp_40p || score.pass_td_40p)) {
                                    entry.bonus = true;
                                    if(score.pass_td_40p) {
                                        entry.bonusDesc.push('40+ YARD TD PASS');
                                    }
                                    if(score.pass_cmp_40p) {
                                        entry.bonusDesc.push('40+ YARD PASS');
                                    }
                                }
                                if(50 <= player.yards && score.pass_td_50p) {
                                    entry.bonus = true;
                                    entry.bonusDesc.push('50+ YARD TD PASS');
                                }
                                if(score.bonus_pass_yd_300 || score.bonus_pass_yd_400 || score.bonus_pass_cmp_25) {
                                    const passingBonusInfo = processBonus(player.yards, player, 'passing', null);
                                    if(passingBonusInfo.bonus == true) {
                                        entry.bonus = true;
                                        entry.fpts += passingBonusInfo.fpts;
                                        for(const bonus of passingBonusInfo.bonusDesc) {
                                            entry.bonusDesc.push(bonus);
                                        }
                                    }
                                }
                                fantasyPlay[play.playID].push(entry);
                            } else if(player.statType == 'receiver') {                // RECEIVING TD TO-DO: check if lateral ending in TD changes things
                                const fpts = player.yards * (score?.rec_yd || 0) + (score?.rec_td || 0) + (score?.rec || 0) + (40 <= player.yards && player.yards < 50 && score.rec_td_40p ? score.rec_td_40p : 0) + (50 <= player.yards && score.rec_td_50p ? score.rec_td_50p : 0);
                                const entry = {
                                    order: play.order,
                                    side: 'offense',
                                    manager: player.manager,
                                    playerInfo: player.playerInfo,
                                    fpts,
                                    yards: player.yards,
                                    description: play.description,
                                    shortDesc: 'Receiving Touchdown',
                                    bonus: false,
                                    bonusDesc: [],
                                }
                                if(40 <= player.yards && player.yards < 50 && score.rec_td_40p) {
                                    entry.bonus = true;
                                    entry.bonusDesc.push('40+ YARD RECEIVING TD')
                                } else if(50 <= player.yards && score.rec_td_50p) {
                                    entry.bonus = true;
                                    entry.bonusDesc.push('50+ YARD RECEIVING TD')
                                }
                                const receptionBonusInfo = processBonus(player.yards, player, 'receiving', 'reception');
                                entry.fpts += receptionBonusInfo.fpts;
                                if(receptionBonusInfo.bonus == true) {
                                    entry.bonus = true;
                                    for(const bonus of receptionBonusInfo.bonusDesc) {
                                        entry.bonusDesc.push(bonus);
                                    }
                                }
                                fantasyPlay[play.playID].push(entry);
                            }
                        } else if(player.playType == 3 && player.statType == 'passer' && (score.pass_inc || score.pass_att)) {         // INCOMPLETE PASS
                            const fpts = (score?.pass_inc || 0) + (score?.pass_att || 0);
                            const entry = {
                                order: play.order,
                                side: 'offense',
                                manager: player.manager,
                                playerInfo: player.playerInfo,
                                fpts,
                                description: play.description,
                                shortDesc: 'Pass Incomplete',
                                bonus: false, 
                                bonusDesc: [],
                            }
                            fantasyPlay[play.playID].push(entry);
                        } else if(player.playType == 7 && player.statType == 'passer' && score.pass_sack) {                                      // SACK - QB
                            fantasyPlay[play.playID].push({
                                order: play.order,
                                side: 'offense',
                                manager: player.manager,
                                playerInfo: player.playerInfo,
                                fpts: score.pass_sack,
                                description: play.description,
                                shortDesc: 'Sacked',
                                bonus: false, 
                                bonusDesc: [],
                            });
                        } else if(player.playType == 59 && player.statType == 'kicker') {                                   // MADE FIELD GOAL
                            const fpts = (score?.fgm || 0) + player.yards * (score?.fgm_yds || 0);
                            const entry = {
                                order: play.order,
                                side: 'offense',
                                manager: player.manager,
                                playerInfo: player.playerInfo,
                                fpts,
                                yards: player.yards,
                                description: play.description,
                                shortDesc: 'Field Goal Made',
                                bonus: false, 
                                bonusDesc: [],
                            }
                            if(0 < player.yards && player.yards < 20 && score.fgm_0_19) {           // FG YD BONUS
                                entry.fpts += score.fgm_0_19;
                            } else if(19 < player.yards && player.yards < 30 && score.fgm_20_29) {
                                entry.fpts += score.fgm_20_29;
                            } else if(29 < player.yards) {       
                                entry.fpts += ((score?.fgm_yds_over_30 || 0) * (player.yards - 30));
                                const newFpts = (score?.fgm_yds_over_30 || 0) * (player.yards - 30);
                                if(score.fgm_yds_over_30) {
                                    pushRunningTotal(newFpts, statDescriptions['fgm_yds_over_30'], Object.keys(statDescriptions['fgm_yds_over_30']), 1, player.playerInfo.playerID, player.playerInfo.pos);
                                }
                                if(player.yards < 40 && score.fgm_30_39) {
                                    entry.fpts += score.fgm_30_39;
                                } else if(39 < player.yards && player.yards < 50 && score.fgm_40_49) {
                                    entry.fpts += score.fgm_40_49;
                                } else if(player.yards >= 50 && score.fgm_50p) {
                                    entry.fpts += score.fgm_50p;
                                } 
                            }        
                            fantasyPlay[play.playID].push(entry);
                        } else if((player.playType == 60 || player.playType == 18) && player.statType == 'kicker') {           // MISSED FIELD GOAL
                            const entry = {
                                order: play.order,
                                side: 'offense',
                                manager: player.manager,
                                playerInfo: player.playerInfo,
                                fpts: score?.fgmiss || 0,
                                yards: player.yards,
                                description: play.description,
                                shortDesc: 'Missed Field Goal',
                                bonus: false, 
                                bonusDesc: [],
                            }   
                            if(0 < player.yards && player.yards < 20 && score.fgmiss_0_19) {           // MISSED FG YD PENALTY
                                entry.fpts += score.fgmiss_0_19;
                            } else if(19 < player.yards && player.yards < 30 && score.fgmiss_20_29) {
                                entry.fpts += score.fgmiss_20_29;
                            } else if(29 < player.yards && player.yards < 40 && score.fgmiss_30_39) {
                                entry.fpts += score.fgmiss_30_39;
                            } else if(39 < player.yards && player.yards < 50 && score.fgmiss_40_49) {
                                entry.fpts += score.fgmiss_40_49;
                            } else if(player.yards >= 50 && score.fgmiss_50p) {
                                entry.fpts += score.fgmiss_50p;
                            } 
                            fantasyPlay[play.playID].push(entry);                                                          
                        } else if(player.statType == 'patScorer' && play.scoringType == 'touchdown' && score.xpmiss && (play.pointAfterType == 62 || play.pointAfterType == 43)) {                 // PAT MISS
                            fantasyPlay[play.playID].push({
                                order: play.order,
                                side: 'offense',
                                manager: player.manager,
                                playerInfo: player.playerInfo,
                                fpts: score.xpmiss,
                                description: play.description,
                                shortDesc: play.pointAfterType == 62 ? 'PAT Missed' : 'PAT Blocked',
                                bonus: false, 
                                bonusDesc: [],
                            });                                                                                    
                        } else if(player.statType == 'patScorer' && play.scoringType == 'touchdown' && score.xpm && play.pointAfterType == 61) {                    // PAT GOOD
                            fantasyPlay[play.playID].push({
                                order: play.order,
                                side: 'offense',
                                manager: player.manager,
                                playerInfo: player.playerInfo,
                                fpts: score.xpm,
                                description: play.description,
                                shortDesc: 'PAT Made',
                                bonus: false, 
                                bonusDesc: [],
                            });                                                                                    
                        } else if(player.statType == 'returner' && player.playType == 12 && score.kr_yd) {                                  // ST PLAYER - KICK RETURN YDS
                            const fpts = player.yards * score.kr_yd;
                            const entry = {
                                order: play.order,
                                side: 'offense',
                                manager: player.manager,
                                playerInfo: player.playerInfo,
                                fpts,
                                yards: player.yards,
                                description: play.description,
                                shortDesc: 'Kick Return',
                                bonus: false, 
                                bonusDesc: [],
                            }
                            fantasyPlay[play.playID].push(entry);
                        }
                        
                        if(idpEnabled == true) {                                                                         // IDP FPTS
                            if(score.idp_blk_kick && player.statType == 'blocker' && (player.playType == 17 || player.playType == 37 || player.playType == 18 || (player.playType == 60 && play.description.includes('BLOCKED')))) {               // IDP - BLOCK KICK
                                fantasyPlay[play.playID].push({
                                    order: play.order,
                                    side: 'defense',
                                    manager: player.manager,
                                    playerInfo: player.playerInfo,
                                    fpts: score.idp_blk_kick,
                                    description: play.description,
                                    shortDesc: player.playType == 18 || (player.playType == 60 && play.description.includes('BLOCKED')) ? 'Blocked Field Goal' : 'Blocked Punt',
                                    bonus: false, 
                                    bonusDesc: [],
                                });
                            } else if(player.statType == 'passDefender' && (score.idp_pass_def_3p || score.idp_pass_def)) {                     // PASS DEFENSE - IDP
                                const entryIDP = {
                                    order: play.order,
                                    side: 'defense',
                                    manager: player.manager,
                                    playerInfo: player.playerInfo,
                                    fpts: score?.idp_pass_def || 0,
                                    description: play.description,
                                    shortDesc: 'Defended Pass',
                                    bonus: false,
                                    bonusDesc: [],
                                }
                                if(score.idp_pass_def_3p) {
                                    const passDefenseBonusInfo = processBonus(player.yards, player, 'idp', 'passDefense');
                                    if(passDefenseBonusInfo.bonus == true) {
                                        entryIDP.bonus = true;
                                        entryIDP.fpts += passDefenseBonusInfo.fpts;
                                        for(const bonus of passDefenseBonusInfo.bonusDesc) {
                                            entryIDP.bonusDesc.push(bonus);
                                        }
                                    }
                                }   
                                fantasyPlay[play.playID].push(entryIDP);
                            } else if(score.idp_fum_rec && player.statType == 'recoverer' && player.playType != 9) {                            // FUMBLE RECOVERY IDP
                                fantasyPlay[play.playID].push({
                                    order: play.order,
                                    side: 'defense',
                                    manager: player.manager,
                                    playerInfo: player.playerInfo,
                                    fpts: score.idp_fum_rec,
                                    description: play.description,
                                    shortDesc: 'Fumble Recovery',
                                    bonus: false, 
                                    bonusDesc: [],
                                });
                            } else if(score.idp_ff && player.statType == 'forcedBy') {                              // FUMBLE FORCED PTS - IDP
                                fantasyPlay[play.playID].push({
                                    order: play.order,
                                    side: 'defense',
                                    manager: player.manager,
                                    playerInfo: player.playerInfo,
                                    fpts: score.idp_ff,
                                    description: play.description,
                                    shortDesc: 'Forced Fumble',
                                    bonus: false, 
                                    bonusDesc: [],
                                });
                            } else if(player.statType == 'tackler' && player.playType != 52 && player.playType != 12 && (score.idp_tkl || score.idp_tkl_solo || score.idp_tkl_loss || score.bonus_tkl_10p)) {                              
                                const fpts = (score?.idp_tkl || 0) + (score?.idp_tkl_solo || 0) + (score.idp_tkl_loss && player.yards < 0 ? score.idp_tkl_loss : 0);
                                const entryIDP = {                                                                  // SOLO TACKLES - IDP (and offensive player on turnovers)
                                    order: play.order,
                                    side: 'defense',
                                    manager: player.manager,
                                    playerInfo: player.playerInfo,
                                    fpts,
                                    description: play.description,
                                    shortDesc: player.yards < 0 ? 'Solo Tackle for Loss' : 'Solo Tackle',
                                    bonus: false, 
                                    bonusDesc: [],
                                } 
                                if(score.bonus_tkl_10p) {
                                    const tackleBonusInfo = processBonus(player.yards, player, 'idp', 'tackling');
                                    if(tackleBonusInfo.bonus == true) {
                                        entryIDP.bonus = true;
                                        entryIDP.fpts += tackleBonusInfo.fpts;
                                        for(const bonus of tackleBonusInfo.bonusDesc) {
                                            entryIDP.bonusDesc.push(bonus);
                                        }
                                    }
                                }                                 
                                fantasyPlay[play.playID].push(entryIDP); 
                            } else if(player.statType == 'assistedBy' && player.playType != 52 && player.playType != 12 && (score.idp_tkl || score.idp_tkl_ast || score.idp_tkl_loss || score.bonus_tkl_10p)) {                              
                                const fpts = (score?.idp_tkl || 0) + (score?.idp_tkl_ast || 0) + (score.idp_tkl_loss && player.yards < 0 ? score.idp_tkl_loss : 0);
                                const entryIDP = {                                                                  // ASSISTED TACKLES - IDP (and offensive player on turnovers)
                                    order: play.order,
                                    side: 'defense',
                                    manager: player.manager,
                                    playerInfo: player.playerInfo,
                                    fpts,
                                    description: play.description,
                                    shortDesc: player.yards < 0 ? 'Assisted Tackle for Loss' : 'Assisted Tackle',
                                    bonus: false, 
                                    bonusDesc: [],
                                } 
                                if(score.bonus_tkl_10p) {
                                    const tackleBonusInfo = processBonus(player.yards, player, 'idp', 'tackling');
                                    if(tackleBonusInfo.bonus == true) {
                                        entryIDP.bonus = true;
                                        entryIDP.fpts += tackleBonusInfo.fpts;
                                        for(const bonus of tackleBonusInfo.bonusDesc) {
                                            entryIDP.bonusDesc.push(bonus);
                                        }
                                    }
                                }                                
                                fantasyPlay[play.playID].push(entryIDP); 
                            } else if(player.playType == 36 && player.statType == 'scorer' && (score.idp_int || score.idp_def_td || score.idp_int_ret_yd || score.bonus_def_int_td_50p)) {        // P6 IDP
                                const fpts = (score?.idp_int || 0) + (score?.idp_def_td || 0) + player.yards * (score?.idp_int_ret_yd || 0) + (player.yards >= 50 && score.bonus_def_int_td_50p ? score.bonus_def_int_td_50p : 0);
                                const entryIDP = {
                                    order: play.order,
                                    side: 'defense',
                                    manager: player.manager,
                                    playerInfo: player.playerInfo,
                                    fpts,
                                    yards: player.yards,
                                    description: play.description,
                                    shortDesc: 'Pick Six',
                                    bonus: false,
                                    bonusDesc: [],
                                }
                                if(player.yards >= 50 && score.bonus_def_int_td_50p) {                  // P6 IDP YD BONUS
                                    entry.bonus = true;
                                    entry.bonusDesc.push('50+ YARD PICK SIX');
                                }
                                fantasyPlay[play.playID].push(entryIDP);
                            } else if(player.playType == 26 && player.statType == 'returner' && (score.idp_int || score.idp_int_ret_yd)) {                     // IDP - INT
                                const fpts = (score?.idp_int || 0) + player.yards * (score?.idp_int_ret_yd || 0);
                                const entryIDP = {
                                    order: play.order,
                                    side: 'defense',
                                    manager: player.manager,
                                    playerInfo: player.playerInfo,
                                    fpts,
                                    yards: player.yards,
                                    description: play.description,
                                    shortDesc: 'Interception',
                                    bonus: false,
                                    bonusDesc: [],
                                }
                                fantasyPlay[play.playID].push(entryIDP);
                            } else if((score.idp_def_td || score.bonus_def_fum_td_50p) && player.statType == 'scorer' && (player.playType == 17 || player.playType == 37 || player.playType == 29 || player.playType == 39 || player.playType == 43 || player.playType == 57)) {               // IDP - SCORE (other than pick 6)
                                if(score.idp_def_td && (player.playType == 17 || player.playType == 37)) {                        // IDP - BLOCKED PUNT RETURN TD TO-DO: IDP blocked PAT -> 2pt conversion WFT v SEA week 12 2021
                                    fantasyPlay[play.playID].push({
                                        order: play.order,
                                        side: 'defense',
                                        manager: player.manager,
                                        playerInfo: player.playerInfo,
                                        fpts: score.idp_def_td,
                                        description: play.description,
                                        shortDesc: 'Blocked Punt -> Touchdown',
                                        bonus: false, 
                                        bonusDesc: [],
                                    });
                                } else if((score.bonus_def_fum_td_50p || score.idp_def_td) && (player.playType == 29 || player.playType == 39)) {                        // IDP - FUMBLE SIX TO-DO 50+ bonus
                                    const fpts = (score?.idp_def_td || 0) + (score.bonus_def_fum_td_50p && player.yards >= 50 ? score.bonus_def_fum_td_50p : 0);
                                    const entryIDP = {
                                        order: play.order,
                                        side: 'defense',
                                        manager: player.manager,
                                        playerInfo: player.playerInfo,
                                        fpts,
                                        description: play.description,
                                        shortDesc: 'Fumble Six',
                                        bonus: false, 
                                        bonusDesc: [],
                                    }
                                    fantasyPlay[play.playID].push(entryIDP);
                                }
                            } else if(player.playType == 7 && player.statType == 'sackedBy' && (score.idp_sack || score.idp_sack_yd || score.idp_qb_hit || score.idp_tkl || score.idp_tkl_loss || score.idp_tkl_solo || score.bonus_sack_2p)) {                                                     
                                const fpts = (score?.idp_sack || 0) + player.yards * (score?.idp_sack_yd || 0) + (score?.idp_qb_hit || 0) + (score?.idp_tkl || 0) + (score?.idp_tkl_loss);              // SACK IDP - TO:DO look into assisted sacks
                                const entryIDP = {
                                    order: play.order,
                                    side: 'defense',
                                    manager: player.manager,
                                    playerInfo: player.playerInfo,
                                    fpts,
                                    yards: player.yards,
                                    description: play.description,
                                    shortDesc: 'Sack',
                                    bonus: false,
                                    bonusDesc: [],
                                }
                                if(score.bonus_sack_2p) {
                                    const sackBonusInfo = processBonus(player.yards, player, 'idp', 'sacks');
                                    if(sackBonusInfo.bonus == true) {
                                        entryIDP.bonus = true;
                                        entryIDP.fpts += sackBonusInfo.fpts;
                                        for(const bonus of sackBonusInfo.bonusDesc) {
                                            entryIDP.bonusDesc.push(bonus);
                                        }
                                    }
                                }   
                                fantasyPlay[play.playID].push(entryIDP);
                            } else if(player.playType == 20 && (score.idp_safe || score.idp_sack || score.idp_sack_yd || score.idp_qb_hit || score.idp_tkl || score.idp_tkl_loss || score.idp_tkl_ast || score.idp_tkl_solo || score.bonus_sack_2p)) {
                                if(player.statType == 'sackedBy' && (score.idp_sack || score.idp_sack_yd || score.idp_qb_hit || score.idp_tkl || score.idp_tkl_loss || score.idp_tkl_ast || score.idp_tkl_solo || score.bonus_sack_2p)) {     // SAFETY - IDP - TO-DO: account for assisted tackles/sacks IDP                                                
                                    const fpts = (score?.idp_sack || 0) + player.yards * (score?.idp_sack_yd || 0) + (score?.idp_qb_hit || 0) + (score?.idp_tkl || 0) + (score?.idp_tkl_loss);
                                    const entryIDP = {
                                        order: play.order,
                                        side: 'defense',
                                        manager: player.manager,
                                        playerInfo: player.playerInfo,
                                        fpts,
                                        yards: player.yards,
                                        description: play.description,
                                        shortDesc: 'Sack',
                                        bonus: false,
                                        bonusDesc: [],
                                    }
                                    if(score.bonus_sack_2p) {
                                        const sackBonusInfo = processBonus(player.yards, player, 'idp', 'sacks');
                                        if(sackBonusInfo.bonus == true) {
                                            entryIDP.bonus = true;
                                            entryIDP.fpts += sackBonusInfo.fpts;
                                            for(const bonus of sackBonusInfo.bonusDesc) {
                                                entryIDP.bonusDesc.push(bonus);
                                            }
                                        }
                                    }   
                                    fantasyPlay[play.playID].push(entryIDP);
                                } else if(player.statType == 'scorer' && score.idp_safe) {
                                    fantasyPlay[play.playID].push({
                                        order: play.order,
                                        side: 'defense',
                                        manager: player.manager,
                                        playerInfo: player.playerInfo,
                                        stat: ['safe'],
                                        runningTotals: [],
                                        fpts: score.idp_safe,
                                        description: play.description,
                                        shortDesc: 'Safety',
                                        bonus: false,
                                        bonusDesc: [],
                                    });
                                }
                            }
                        }
                    }                      
                }
            }
            if(defenseEnabled == true) {
                // loop thru def-thresh plays                                                               // TEAM DEF YDS ALLOWED
                for(const playKey in defYardsArray) {
                    const play = defYardsArray[playKey];
                    if(!fantasyPlay[play.playInfo.playID]) {
                        fantasyPlay[play.playInfo.playID] = [];
                    }
                    if(play.defense == awayTeam) {
                        let curDEFscore = calculateDefYardsAllowed(play.new);
                        let oldDEFscore = calculateDefYardsAllowed(play.old);
                        const fpts = curDEFscore.DEFscore - oldDEFscore.DEFscore;
                        if(fpts != 0) {
                            fantasyPlay[play.playInfo.playID].push({
                                order: play.playInfo.order,
                                side: 'defense',
                                manager: awayDefense.owner,
                                playerInfo: awayDefense,
                                fpts,
                                description: play.playInfo.description,
                                shortDesc: curDEFscore.DEFdescription,
                                bonus: false,
                                bonusDesc: [],
                            });
                        }                
                    } else if(play.defense == homeTeam) {
                        let curDEFscore = calculateDefYardsAllowed(play.new);
                        let oldDEFscore = calculateDefYardsAllowed(play.old);
                        const fpts = curDEFscore.DEFscore - oldDEFscore.DEFscore;
                        if(fpts != 0) {
                            fantasyPlay[play.playInfo.playID].push({
                                order: play.playInfo.order,
                                side: 'defense',
                                manager: homeDefense.owner,
                                playerInfo: homeDefense,
                                fpts,
                                description: play.playInfo.description,
                                shortDesc: curDEFscore.DEFdescription,
                                bonus: false,
                                bonusDesc: [],
                            });
                        }
                    }
                }
                // if game has started and a DEF is playing, push entry for their starting points 
                if((gameState == 'in' || gameState == 'post') && (homeDefStarted == true || awayDefStarted == true)) {
                    if(homeDefStarted == true) {
                        const fptsPTS = (score?.pts_allow_0 || 0);
                        const fptsYDS = (score?.yds_allow_0_100 || 0);
                        if(fptsPTS != 0) {
                            fantasyPlay[9999999] = [];
                            fantasyPlay[9999999].push({
                                order: 1,
                                side: 'defense',
                                manager: homeDefense.owner,
                                playerInfo: homeDefense,
                                fpts: fptsPTS,
                                description: 'GAME BEGINS - DEF has allowed 0 points',
                                shortDesc: 'Points Allowed (0)',
                                bonus: false,
                                bonusDesc: [],
                            });
                        } 
                        if(fptsYDS != 0) {
                            fantasyPlay[9999998] = [];
                            fantasyPlay[9999998].push({
                                order: 1,
                                side: 'defense',
                                manager: homeDefense.owner,
                                playerInfo: homeDefense,
                                fpts: fptsYDS,
                                description: 'GAME BEGINS - DEF has allowed 0 yards',
                                shortDesc: 'Yards Allowed (0)',
                                bonus: false,
                                bonusDesc: [],
                            });
                        }
                    }
                    if(awayDefStarted == true) {
                        const fptsPTS = (score?.pts_allow_0 || 0);
                        const fptsYDS = (score?.yds_allow_0_100 || 0);
                        if(fptsPTS != 0) {
                            fantasyPlay[9999999] = [];
                            fantasyPlay[9999999].push({
                                order: 2,
                                side: 'defense',
                                manager: awayDefense.owner,
                                playerInfo: awayDefense,
                                fpts: fptsPTS,
                                description: 'GAME BEGINS - DEF has allowed 0 points',
                                shortDesc: 'Points Allowed (0)',
                                bonus: false,
                                bonusDesc: [],
                            });
                        }
                        if(fptsYDS != 0) {
                            fantasyPlay[9999998] = [];
                            fantasyPlay[9999998].push({
                                order: 2,
                                side: 'defense',
                                manager: awayDefense.owner,
                                playerInfo: awayDefense,
                                fpts: fptsYDS,
                                description: 'GAME BEGINS - DEF has allowed 0 yards',
                                shortDesc: 'Yards Allowed (0)',
                                bonus: false,
                                bonusDesc: [],
                            });
                        }
                    }
                }
            }

            for(const key in fantasyPlay) {
                processedPlays.push(fantasyPlay[key]);
            }
            processedPlays = processedPlays.sort((a, b) => b[0]?.order - a[0]?.order);

            return processedPlays;
        }
        // calculates passing points/info
        const processPassing = (playerID, allStats, defensiveStats) => {
            const passingStats = allStats.find(c => c.name == 'passing').stats;
            const scoringStats = allStats.find(c => c.name == 'scoring')?.stats || null;
            const pass_inc = passingStats.find(s => s.abbreviation == 'ATT').value - passingStats.find(s => s.abbreviation == 'CMP').value;
            const pass_td_40p = scoringStats ? scoringStats.find(s => s.abbreviation == 'PASSTD40TO49').value + scoringStats.find(s => s.abbreviation == 'PASSTD50PLUS').value : 0;
            const passingTotals = {
                pass_fd: passingStats.find(s => s.abbreviation == 'FIRST').value,
                pass_cmp: passingStats.find(s => s.name == 'completions').value,
                pass_int: passingStats.find(s => s.abbreviation == 'INT').value,
                pass_att: passingStats.find(s => s.abbreviation == 'ATT').value,
                pass_inc: pass_inc,
                pass_sack: passingStats.find(s => s.abbreviation == 'SACK').value,
                pass_td: passingStats.find(s => s.name == 'passingTouchdowns').value,
                pass_yd: passingStats.find(s => s.abbreviation == 'YDS').value,
                pass_2pt: passingStats.find(s => s.abbreviation == '2PTP').value,
                pass_int_td: defensiveStats.find(s => s.abbreviation == 'TD').value,
                pass_td_40p: pass_td_40p,
                pass_td_50p: scoringStats ? scoringStats.find(s => s.abbreviation == 'PASSTD50PLUS').value : 0,
                bonus_pass_cmp_25: passingStats.find(s => s.name == 'completions').value >= 25 ? 1 : 0,
                bonus_pass_yd_300: passingStats.find(s => s.abbreviation == 'YDS').value >= 300 ? 1 : 0,
                bonus_pass_yd_400: passingStats.find(s => s.abbreviation == 'YDS').value >= 400 ? 1 : 0,
            }
            const passingInfo = {
                qbRating: passingStats.find(s => s.abbreviation == 'RAT').value,
                compPerc: passingStats.find(s => s.abbreviation == 'CMP%').value,
                ydsPerCmp: passingStats.find(s => s.shortDisplayName == 'YDS/CMP').value,
                yardsAtCatch: passingStats.find(s => s.abbreviation == 'PY@C').value,
                longestPass: passingStats.find(s => s.abbreviation == 'LNG').value,
            }
            const statsEntry = {
                fpts: 0,
                stats: [],
                info: {
                    passing: passingInfo,
                },
                playerID: playerID,
            }
            for(const key in passingTotals) {
                const fpts = score[key] ? passingTotals[key] * score[key] : 0;
                if(fpts != 0) {
                    statsEntry.fpts += fpts;
                    statsEntry.stats.push({
                        stat: key,
                        statDesc: statDescriptions[key],
                        metric: key.includes('bonus') ? 'bonus' : passingTotals[key],
                        fpts,
                    })
                }
            }
            return statsEntry;
        }
        // calculates general points/info
        const processGeneral = (playerID, allStats, totalSnaps) => {
            const generalStats = allStats.find(c => c.name == 'general').stats;
            const snapPerc = (allStats.find(c => c.stats.find(s => s.abbreviation == 'OP'))?.stats.find(a => a.abbreviation == 'OP').value || 0) / totalSnaps * 100;
            const rush_rec_yd = (allStats.find(c => c.name == 'rushing')?.stats.find(s => s.abbreviation == 'YDS').value || 0) + (allStats.find(c => c.name == 'receiving')?.stats.find(s => s.abbreviation == 'YDS').value || 0);
            const generalTotals = {
                fum: generalStats.find(s => s.abbreviation == 'FUM')?.value || null,
                fum_lost: generalStats.find(s => s.abbreviation == 'LST')?.value || null,
                fum_rec_td: generalStats.find(s => s.abbreviation == 'FTD')?.value || null,
                bonus_rush_rec_yd_100: rush_rec_yd >= 100 && rush_rec_yd < 200 ? 1 : 0,
                bonus_rush_rec_yd_200: rush_rec_yd >= 200 ? 1 : 0,
                kr_yd: allStats.find(c => c.name == 'returning')?.stats.find(s => s.shortDisplayName == 'KRYDS')?.value || null,
                pr_yd: allStats.find(c => c.name == 'returning')?.stats.find(s => s.shortDisplayName == 'PRYDS')?.value || null,
                st_td: allStats.find(c => c.name == 'returning')?.stats.find(s => s.shortDisplayName == 'KRTD')?.value || null,
            }
            const generalInfo = {
                snaps: allStats.find(c => c.stats.find(s => s.abbreviation == 'OP'))?.stats.find(a => a.abbreviation == 'OP').value,
                teamSnaps: totalSnaps,
                snapPerc: snapPerc,
                ydsPerKR: allStats.find(c => c.name == 'returning')?.stats.find(s => s.shortDisplayName == 'YDS/KR')?.value || null,
                ydsPerPR: allStats.find(c => c.name == 'returning')?.stats.find(s => s.shortDisplayName == 'YDS/PR')?.value || null,
                ydsPerReturn: allStats.find(c => c.name == 'returning')?.stats.find(s => s.shortDisplayName == 'YDS/R')?.value || null,
            }
            const statsEntry = {
                fpts: 0,
                stats: [],
                info: {
                    general: generalInfo,
                },
                playerID: playerID,
            }
            for(const key in generalTotals) {
                const fpts = score[key] ? generalTotals[key] * score[key] : 0;

                if(fpts != 0) {
                    statsEntry.fpts += fpts;
                    statsEntry.stats.push({
                        stat: key,
                        statDesc: statDescriptions[key],
                        metric: key.includes('bonus') ? 'bonus' : generalTotals[key],
                        fpts,
                    })
                }
            }
            return statsEntry;
        }
        // calculates team def points
        const processDefense = (playerID, allStats, opponentStats) => {

            const defensiveStats = allStats.find(c => c.name == 'defensive')?.stats || null;
            const returningStats = allStats.find(c => c.name == 'returning')?.stats || null;

            const def_st_td = (defensiveStats?.find(s => s.abbreviation == 'BPTD').value || 0) + (defensiveStats?.find(s => s.abbreviation == 'BFGTD').value || 0) + (returningStats?.find(s => s.shortDisplayName == 'KRTD').value || 0) + (returningStats?.find(s => s.shortDisplayName == 'PRTD').value || 0);
            const safe = (defensiveStats?.find(s => s.abbreviation == 'SAFE').value || 0) + (defensiveStats?.find(s => s.abbreviation == 'OPSM').value || 0);
            const fum_lost = (returningStats?.find(s => s.abbreviation == 'KRFL').value || 0) + (returningStats?.find(s => s.abbreviation == 'PRFL').value || 0);
            const fum = (returningStats?.find(s => s.abbreviation == 'KRF').value || 0) + (returningStats?.find(s => s.abbreviation == 'PRF').value || 0);
            const def_pass_def = (defensiveStats?.find(s => s.abbreviation == 'PD').value || 0) + (defensiveStats?.find(s => s.abbreviation == 'BATD').value || 0);
            const fum_rec = (opponentStats.find(c => c.name == 'general')?.stats.find(s => s.abbreviation == 'LST').value || 0) - ((opponentStats.find(c => c.name == 'returning')?.stats.find(s => s.abbreviation == 'KRFL').value || 0) + (opponentStats.find(c => c.name == 'returning')?.stats.find(s => s.abbreviation == 'PRFL').value || 0));
            const def_4_and_stop = (opponentStats.find(c => c.abbreviation == 'misc')?.stats.find(s => s.abbreviation == 'FDA').value || 0) - (opponentStats.find(c => c.abbreviation == 'misc')?.stats.find(s => s.abbreviation == '4THC').value || 0);
            
            const pointsAllowed = defensiveStats?.find(s => s.abbreviation == 'PA').value || 0;
            let yardsAllowed = defensiveStats?.find(s => s.abbreviation == 'YA').value || 0; 
            if(score.def_kr_yd) yardsAllowed += opponentStats.find(c => c.name == 'kicking')?.stats.find(s => s.abbreviation == 'KRYDS').value || 0;
            if(score.def_pr_yd) yardsAllowed += opponentStats.find(c => c.name == 'punting')?.stats.find(s => s.shortDisplayName == 'PRYDS').value || 0;
            
            const defensiveTotals = {
                pts_allow: pointsAllowed,
                pts_allow_0: pointsAllowed == 0 ? 1 : 0,
                pts_allow_1_6: pointsAllowed > 0 && pointsAllowed < 7 ? 1 : 0,
                pts_allow_7_13: pointsAllowed > 6 && pointsAllowed < 14 ? 1 : 0,
                pts_allow_14_20: pointsAllowed > 13 && pointsAllowed < 21 ? 1 : 0,
                pts_allow_21_27: pointsAllowed > 20 && pointsAllowed < 28 ? 1 : 0,
                pts_allow_28_34: pointsAllowed > 27 && pointsAllowed < 35 ? 1 : 0,
                pts_allow_35p: pointsAllowed > 34 ? 1 : 0,
                yds_allow: yardsAllowed,
                yds_allow_0_100: yardsAllowed >= 0 && yardsAllowed < 100 ? 1 : 0,
                yds_allow_100_199: yardsAllowed > 99 && yardsAllowed < 200 ? 1 : 0,
                yds_allow_200_299: yardsAllowed > 199 && yardsAllowed < 300 ? 1 : 0,
                yds_allow_300_349: yardsAllowed > 299 && yardsAllowed < 350 ? 1 : 0,
                yds_allow_350_399: yardsAllowed > 349 && yardsAllowed < 400 ? 1 : 0,
                yds_allow_400_449: yardsAllowed > 399 && yardsAllowed < 450 ? 1 : 0,
                yds_allow_450_499: yardsAllowed > 449 && yardsAllowed < 500 ? 1 : 0,
                yds_allow_500_549: yardsAllowed > 499 && yardsAllowed < 550 ? 1 : 0,
                yds_allow_550p: yardsAllowed > 549 ? 1 : 0,
                tkl: defensiveStats?.find(s => s.abbreviation == 'TOT').value || 0,
                tkl_loss: defensiveStats?.find(s => s.abbreviation == 'TFL').value || 0,
                tkl_ast: defensiveStats?.find(s => s.abbreviation == 'AST').value || 0,
                qb_hit: defensiveStats?.find(s => s.abbreviation == 'QB HTS').value || 0,
                blk_kick: defensiveStats?.find(s => s.abbreviation == 'KB').value || 0,
                def_td: defensiveStats?.find(s => s.name == 'defensiveTouchdowns').value || 0,
                def_2pt: defensiveStats?.find(s => s.abbreviation == '2PTR').value || 0,
                def_st_td: def_st_td,
                sack: defensiveStats?.find(s => s.abbreviation == 'SACK').value || 0,
                sack_yd: defensiveStats?.find(s => s.abbreviation == 'SCKYDS').value || 0,
                safe: safe,
                def_pass_def: def_pass_def,
                fum_rec: fum_rec,
                def_st_fum_rec: returningStats?.find(s => s.abbreviation == 'FR').value || 0,
                fum_ret_yd: returningStats?.find(s => s.abbreviation == 'DFRYDS').value || 0,
                int: allStats.find(c => c.abbreviation == 'defint')?.stats.find(s => s.abbreviation == 'INT').value || 0,
                int_ret_yd: allStats.find(c => c.abbreviation == 'defint')?.stats.find(s => s.abbreviation == 'YDS').value || 0,
                def_4_and_stop: def_4_and_stop,
                def_forced_punts: opponentStats.find(c => c.abbreviation == 'punt')?.stats.find(s => s.abbreviation == 'PUNTS').value || 0,
                def_pr_yd: returningStats?.find(s => s.abbreviation == 'YDS').value || 0,
                fum_lost: fum_lost,
                fum: fum,
            }
            const defensiveInfo = {
                hurries: defensiveStats?.find(s => s.abbreviation == 'HUR').value || 0,
                yardsAllowed: yardsAllowed,
                pointsAllowed: pointsAllowed,
            }

            const statsEntry = {
            fpts: 0,
            stats: [],
            info: {
                defense: defensiveInfo,
            },
            playerID: playerID,
        }
            
            for(const key in defensiveTotals) {
                const fpts = score[key] ? defensiveTotals[key] * score[key] : 0;

                if(fpts != 0) {
                    statsEntry.fpts += fpts;

                    let metric = defensiveTotals[key];
                    if(key.includes('pts_allow')) {
                        metric = defensiveStats?.find(s => s.abbreviation == 'PA').value || 0;
                    } else if(key.includes('yds_allow')) {
                        metric = yardsAllowed;
                    }
                    
                    statsEntry.stats.push({
                        stat: key,
                        statDesc: statDescriptions[key],
                        metric: metric,
                        fpts,
                    })
                }
            }
            
            return statsEntry;
        }
        // calculates idp points
        const processIDP = (playerID, allStats) => {
            const defensiveStats = allStats.find(c => c.name == 'defensive').stats;
            const returningStats = allStats.find(c => c.name == 'returning').stats;
            const generalStats = allStats.find(c => c.name == 'general').stats;

            const idp_safe = defensiveStats.find(s => s.abbreviation == 'SAFE').value + defensiveStats.find(s => s.abbreviation == 'OPSM').value;
            const idp_pass_def = defensiveStats.find(s => s.abbreviation == 'PD').value + defensiveStats.find(s => s.abbreviation == 'BATD').value;
            const idp_sack = defensiveStats.find(s => s.abbreviation == 'SACK').value + (defensiveStats.find(s => s.abbreviation == 'SCKAST').value / 2);
            
            const defensiveTotals = {
                idp_tkl: defensiveStats.find(s => s.abbreviation == 'TOT').value,
                bonus_tkl_10p: defensiveStats.find(s => s.abbreviation == 'TOT').value >= 10 ? 1 : 0,
                idp_tkl_loss: defensiveStats.find(s => s.abbreviation == 'TFL').value,
                idp_tkl_ast: defensiveStats.find(s => s.abbreviation == 'AST').value,
                idp_qb_hit: defensiveStats.find(s => s.abbreviation == 'QB HTS').value,
                idp_blk_kick: defensiveStats.find(s => s.abbreviation == 'KB').value,
                idp_def_td: defensiveStats.find(s => s.name == 'defensiveTouchdowns').value,
                def_2pt: defensiveStats.find(s => s.abbreviation == '2PTR').value,
                idp_ff: generalStats.find(s => s.abbreviation == 'FF').value,
                idp_sack: idp_sack,
                idp_sack_yd: defensiveStats.find(s => s.abbreviation == 'SCKYDS').value,
                bonus_sack_2p: idp_sack >= 2 ? 1 : 0,
                idp_safe: idp_safe,
                idp_pass_def: idp_pass_def,
                idp_pass_def_3p: idp_pass_def >= 3 ? 1 : 0,
                idp_fum_rec: generalStats.find(s => s.abbreviation == 'FR').value,
                idp_fum_ret_yd: returningStats.find(s => s.abbreviation == 'DFRYDS').value,
                idp_int: allStats.find(c => c.abbreviation == 'defint').stats.find(s => s.abbreviation == 'INT').value,
                idp_int_ret_yd: allStats.find(c => c.abbreviation == 'defint').stats.find(s => s.abbreviation == 'YDS').value,
            }
            const defensiveInfo = {
                hurries: defensiveStats.find(s => s.abbreviation == 'HUR').value,
            }
            const statsEntry = {
                fpts: 0,
                stats: [],
                info: {
                    idp: defensiveInfo,
                },
                playerID: playerID,
            }
            for(const key in defensiveTotals) {
                const fpts = score[key] ? defensiveTotals[key] * score[key] : 0;
                if(fpts != 0) {
                    statsEntry.fpts += fpts;
                    statsEntry.stats.push({
                        stat: key,
                        statDesc: statDescriptions[key],
                        metric: key.includes('bonus') || key == 'idp_pass_def_3p' ? 'bonus' : defensiveTotals[key],
                        fpts,
                    })
                }
            }
            return statsEntry;
        }
        // calculates rushing points
        const processRushing = (playerID, allStats) => {
            const rushingStats = allStats.find(c => c.name == 'rushing').stats;
            const scoringStats =  allStats.find(c => c.name == 'scoring')?.stats || null;
            const rush_td_40p = scoringStats ? scoringStats.find(s => s.abbreviation == 'RUSHTD40TO49').value + scoringStats.find(s => s.abbreviation == 'RUSHTD50PLUS').value : 0;

            const rushingTotals = {
                rush_fd: rushingStats.find(s => s.abbreviation == 'FD').value,
                rush_att: rushingStats.find(s => s.abbreviation == 'ATT').value,
                bonus_rush_att_20: rushingStats.find(s => s.abbreviation == 'ATT').value >= 20 ? 1 : 0,
                rush_td: rushingStats.find(s => s.name == 'rushingTouchdowns').value,
                rush_yd: rushingStats.find(s => s.abbreviation == 'YDS').value,
                rush_2pt: rushingStats.find(s => s.abbreviation == '2PTR').value,
                bonus_rush_yd_100: rushingStats.find(s => s.abbreviation == 'YDS').value >= 100 && rushingStats.find(s => s.abbreviation == 'YDS').value < 200 ? 1 : 0,
                bonus_rush_yd_200: rushingStats.find(s => s.abbreviation == 'YDS').value >= 200 ? 1 : 0,
                rush_td_40p: rush_td_40p,
                rush_td_50p: scoringStats ? scoringStats.find(s => s.abbreviation == 'RUSHTD50PLUS').value : 0,
            }
            const rushingInfo = {
                stuffed: rushingStats.find(s => s.abbreviation == 'STF').value,
                ypc: rushingStats.find(s => s.abbreviation == 'AVG').value,
                longestRush: rushingStats.find(s => s.abbreviation == 'LNG').value,
            }
            const statsEntry = {
                fpts: 0,
                stats: [],
                info: {
                    rushing: rushingInfo,
                },
                playerID: playerID,
            }
            for(const key in rushingTotals) {
                const fpts = score[key] ? rushingTotals[key] * score[key] : 0;
                if(fpts != 0) {
                    statsEntry.fpts += fpts;
                    statsEntry.stats.push({
                        stat: key,
                        statDesc: statDescriptions[key],
                        metric: key.includes('bonus') ? 'bonus' : rushingTotals[key],
                        fpts,
                    })
                }
            }
            return statsEntry;
        }
        // calculates receiving points
        const processReceiving = (playerID, allStats) => {
            const receivingStats = allStats.find(c => c.name == 'receiving').stats;
            const scoringStats =  allStats.find(c => c.name == 'scoring')?.stats || null;
            const rec_td_40p = scoringStats ? scoringStats.find(s => s.abbreviation == 'RECTD40TO49').value + scoringStats.find(s => s.abbreviation == 'RECTD50PLUS').value : 0;
            const receiverPosition = allPlayersInfo.find(p => p.espnID == playersInfo.players[playerID].espnID).pos;
            const receivingTotals = {
                bonus_rec_rb: receiverPosition == 'RB' ? receivingStats.find(s => s.abbreviation == 'REC').value : 0,
                bonus_rec_te: receiverPosition == 'TE' ? receivingStats.find(s => s.abbreviation == 'REC').value : 0,
                bonus_rec_wr: receiverPosition == 'WR' ? receivingStats.find(s => s.abbreviation == 'REC').value : 0,
                bonus_rec_yd_100: receivingStats.find(s => s.abbreviation == 'YDS').value >= 100 && receivingStats.find(s => s.abbreviation == 'YDS').value < 200 ? 1 : 0,
                bonus_rec_yd_200: receivingStats.find(s => s.abbreviation == 'YDS').value >= 200 ? 1 : 0,
                rec_fd: receivingStats.find(s => s.abbreviation == 'FD').value,
                rec_2pt: receivingStats.find(s => s.abbreviation == '2PTR').value,
                rec_yd: receivingStats.find(s => s.abbreviation == 'YDS').value,
                rec_td: receivingStats.find(s => s.name == 'receivingTouchdowns').value,
                rec: receivingStats.find(s => s.abbreviation == 'REC').value,
                rec_td_40p: rec_td_40p,
                rec_td_50p: scoringStats ? scoringStats.find(s => s.abbreviation == 'RECTD50PLUS').value : 0,
            }
            const receivingInfo = {
                longestReception: receivingStats.find(s => s.abbreviation == 'LNG').value,
                yac: receivingStats.find(s => s.abbreviation == 'YAC').value,
                ypr: receivingStats.find(s => s.shortDisplayName == 'YDS/R').value,
                targets: receivingStats.find(s => s.abbreviation == 'TGTS').value,
            }
            const statsEntry = {
                fpts: 0,
                stats: [],
                info: {
                    receiving: receivingInfo,
                },
                playerID: playerID,
            }
            for(const key in receivingTotals) {
                const fpts = score[key] ? receivingTotals[key] * score[key] : 0;
                if(fpts != 0) {
                    statsEntry.fpts += fpts;

                    let metric = receivingTotals[key];
                    if(key.includes('bonus')) {
                        metric = 'bonus';
                    } 

                    statsEntry.stats.push({
                        stat: key,
                        statDesc: statDescriptions[key],
                        metric: metric,
                        fpts: fpts,
                    })
                }
            }
            return statsEntry;
        }
        // calculates kicker points
        const processKicker = (playerID, kickingStats) => {
            const xpmiss = kickingStats.find(s => s.abbreviation == 'XPA').value - kickingStats.find(s => s.abbreviation == 'XPM').value;
            const fgmiss = kickingStats.find(s => s.abbreviation == 'FGA').value - kickingStats.find(s => s.abbreviation == 'FGM').value;
            const fgmiss_0_19 = kickingStats.find(s => s.abbreviation == 'FGA 1-19').value - kickingStats.find(s => s.abbreviation == 'FGM 1-19').value;
            const fgmiss_20_29 = kickingStats.find(s => s.abbreviation == 'FGA 20-29').value - kickingStats.find(s => s.abbreviation == 'FGM 20-29').value;
            const fgmiss_30_39 = kickingStats.find(s => s.abbreviation == 'FGA 30-39').value - kickingStats.find(s => s.abbreviation == 'FGM 30-39').value;
            const fgmiss_40_49 = kickingStats.find(s => s.abbreviation == 'FGA 40-49').value - kickingStats.find(s => s.abbreviation == 'FGM 40-49').value;
            const fgmiss_50p = kickingStats.find(s => s.abbreviation == 'FGA 50+').value - kickingStats.find(s => s.abbreviation == '50+').value;

            const kickingTotals = {
                xpm: kickingStats.find(s => s.abbreviation == 'XPM').value,
                xpmiss: xpmiss,
                fgm: kickingStats.find(s => s.abbreviation == 'FGM').value,
                fgm_0_19: kickingStats.find(s => s.abbreviation == 'FGM 1-19').value,
                fgm_20_29: kickingStats.find(s => s.abbreviation == 'FGM 20-29').value,
                fgm_30_39: kickingStats.find(s => s.abbreviation == 'FGM 30-39').value,
                fgm_40_49: kickingStats.find(s => s.abbreviation == 'FGM 40-49').value,
                fgm_50p: kickingStats.find(s => s.abbreviation == '50+').value,
                fgm_yds: kickingStats.find(s => s.abbreviation == 'FGMYDS').value,
                fgmiss: fgmiss,
                fgmiss_0_19: fgmiss_0_19,
                fgmiss_20_29: fgmiss_20_29,
                fgmiss_30_39: fgmiss_30_39,
                fgmiss_40_49: fgmiss_40_49,
                fgmiss_50p: fgmiss_50p,
            }
            const kickingInfo = {
                xpPerc: kickingStats.find(s => s.abbreviation == 'XP%').value,
                xpBlocked: kickingStats.find(s => s.abbreviation == 'XPB').value,
                xpAtt: kickingStats.find(s => s.abbreviation == 'XPA').value,
                fgPerc: kickingStats.find(s => s.abbreviation == 'FG%').value,
                fgBlocked: kickingStats.find(s => s.abbreviation == 'FGB').value,
                fgAtt: kickingStats.find(s => s.abbreviation == 'FGA').value,
                fgm_60p: kickingStats.find(s => s.abbreviation == 'FGM 60-99').value,
                longestMadeFG: kickingStats.find(s => s.abbreviation == 'LNG').value,
                longestFGTry: kickingStats.find(s => s.abbreviation == 'LFGA').value
            }
            const statsEntry = {
                fpts: 0,
                stats: [],
                info: {
                    kicking: kickingInfo,
                },
                playerID: playerID,
            }
            for(const key in kickingTotals) {
                const fpts = score[key] ? kickingTotals[key] * score[key] : 0;
                if(fpts != 0) {
                    statsEntry.fpts += fpts;

                    statsEntry.stats.push({
                        stat: key,
                        statDesc: statDescriptions[key],
                        metric: kickingTotals[key],
                        fpts,
                    })
                }
            }
            return statsEntry;
        }

        // league matchup play by play
        if(showMatchBox == true) {
            let match = weekMatchups[matchSelection];
            const relevancyKey = {
                recordManIDs: [],
                starters: {},
                startersArray: [],
                games: [],
            }
            runningTotals = {};
            let fantasyProducts_match = [];

            for(const opponent in match) {
                // get managers in matchup
                relevancyKey.recordManIDs.push(match[opponent].recordManID);
                relevancyKey.starters[match[opponent].recordManID] = [];
                // get starters in matchup
                let starters =  match[opponent].starters;

                for(const starter of starters) {
                    if(starter != '0') {
                        const starterInfo = nflPlayerInfo[starter];
                        const team = playersInfo.players[starter].pos == 'DEF' ? nflTeams.find(t => t.sleeperID == starter).espnAbbreviation : starterInfo && starterInfo.espn.t[yearSelection].length > 1 && starterInfo.espn.t[yearSelection].find(w => w.firstWeek <= weekSelection && w.lastWeek >= weekSelection) ? starterInfo.espn.t[yearSelection].find(w => w.firstWeek <= weekSelection && w.lastWeek >= weekSelection).team : playersInfo.players[starter].wi[yearSelection][weekSelection] && playersInfo.players[starter].wi[yearSelection][weekSelection].t ? nflTeams.find(t => t.sleeperID == playersInfo.players[starter].wi[yearSelection][weekSelection].t).espnAbbreviation : starterInfo ? starterInfo.espn.t[yearSelection][0] : 'NONE';
                        const starterEntry = {
                            playerID: starter,
                            espnID: playersInfo.players[starter].pos == 'DEF' ? null : playersInfo.players[starter].espnID ? playersInfo.players[starter].espnID : starterInfo.espn.id,
                            rosterSpot: positions[starters.indexOf(starter)],
                            fpts: match[opponent].points[starters.indexOf(starter)],
                            owner: match[opponent].manager,
                            recordManID: match[opponent].recordManID,
                            fn: playersInfo.players[starter].pos == 'DEF' ? nflTeams.find(t => t.sleeperID == starter).ln : playersInfo.players[starter].fn,
                            ln: playersInfo.players[starter].pos == 'DEF' ? 'Defense' : playersInfo.players[starter].ln,
                            pos: playersInfo.players[starter].pos,
                            t: team,
                            avatar: playersInfo.players[starter].pos == 'DEF' ? `https://sleepercdn.com/images/team_logos/nfl/${starter.toLowerCase()}.png` : `https://sleepercdn.com/content/nfl/players/thumb/${starter}.jpg`,
                            teamAvatar: `https://sleepercdn.com/images/team_logos/nfl/${nflTeams.find(t => t.espnAbbreviation == team).sleeperID.toLowerCase()}.png` || `https://sleepercdn.com/content/nfl/players/thumb/${starter}.jpg`,
                            teamColor: `background-color: #${nflTeams.find(t => t.espnAbbreviation == team).color}6b`,
                            teamAltColor: `background-color: #${nflTeams.find(t => t.espnAbbreviation == team).alternateColor}52`,
                        }

                        relevancyKey.starters[match[opponent].recordManID].push(starterEntry);
                        relevancyKey.startersArray.push(starterEntry);

                        // get starters' game IDs
                        if(nflMatchups.find(m => m.some(m => m.team == nflTeams.find(t => t.espnAbbreviation == team)))) {
                            let nflGameID = nflMatchups.find(m => m.some(m => m.team == nflTeams.find(t => t.espnAbbreviation == team)))[0].gameID;
                            if(!relevancyKey.games.includes(nflGameID)) relevancyKey.games.push(nflGameID);
                        }
                    }
                }
            }
            // process every relevant game's play by play for plays relevant to matchup
            for(const gameSelect in relevancyKey.games) {
                let playByPlayData = await getPlayByPlay(relevancyKey.games[gameSelect]).catch((err) => { console.error(err); });
                let fantasyRelevantPlaysForward = [];
                let defYdsThreshBreakers = [];

                // identify NFL teams in the current game
                let espnTeamIDs = [];
                let game = nflMatchups.find(m => m[0].gameID == relevancyKey.games[gameSelect]);
                let gameState = game[0].status.type.state;

                let home = game[0].sleeperID;
                let homeEspn = game[0].team.espnAbbreviation;
                espnTeamIDs.push(game[0].team.espnID);

                let away = game[1].sleeperID;
                let awayEspn = game[1].team.espnAbbreviation;
                espnTeamIDs.push(game[1].team.espnID);

                let homeDefStarted = false;
                let homeDefense = null;
                let awayDefStarted = false;
                let awayDefense = null;

                let turnoverOnDowns = false;

                let homeDefPtsAllowed = 0;
                let awayDefPtsAllowed = 0;
                let homeDefYdsAllowed = 0;
                let awayDefYdsAllowed = 0;

                // check if either DEF is being started
                if(defenseEnabled == true) {
                    for(const recordManID in relevancyKey.starters) {
                        if(relevancyKey.starters[recordManID].find(s => s.playerID == home)) {
                            homeDefStarted = true;
                            homeDefense = relevancyKey.starters[recordManID].find(s => s.playerID == home);
                        } 
                        if(relevancyKey.starters[recordManID].find(s => s.playerID == away)) {
                            awayDefStarted = true;
                            awayDefense = relevancyKey.starters[recordManID].find(s => s.playerID == away);
                        }
                        if(homeDefStarted == true && awayDefStarted == true) {
                            break;
                        }
                    }
                }

                // calculate total fpts that can be gathered from espn stat summaries
                if(gameState == 'in' || gameState == 'post') {
                    const gameStats = await getGameStats(relevancyKey.games[gameSelect], espnTeamIDs);

                    if(gameStats.home) {

                        const totalSnaps = {};
                        if(defenseEnabled == true) {
                            if(homeDefStarted == true) {
                                runningTotals[home] = processDefense(home, gameStats.home.splits.categories, gameStats.away.splits.categories);
                                runningTotals[home].pos = 'DEF';
                            }
                            if(awayDefStarted == true) {
                                runningTotals[away] = processDefense(away, gameStats.away.splits.categories, gameStats.home.splits.categories);
                                runningTotals[away].pos = 'DEF';
                            }
                            if((runningTotals[home] && runningTotals[home].stats.find(s => s.statDesc == 'def_4_and_stop')) || (runningTotals[away] && runningTotals[away].stats.find(s => s.statDesc == 'def_4_and_stop'))) {
                                turnoverOnDowns = true;
                            }
                        }

                        for(const team in gameStats) {

                            let otherTeam = team == 'home' ? 'away' : 'home'

                            totalSnaps[team] = gameStats[team].splits.categories.find(c => c.stats.find(s => s.abbreviation == 'OP')).stats.find(a => a.abbreviation == 'OP').value;

                            for(const athlete in gameStats[team].splits.categories.find(c => c.name == 'passing').athletes) {
                                const linkType = 'player';
                                const athleteID = parseEspnTeamID(gameStats[team].splits.categories.find(c => c.name == 'passing').athletes[athlete].athlete.$ref, linkType);

                                if(relevancyKey.startersArray.find(s => s.espnID == athleteID)) {
                                    const passerStats = await getPlayerStats(gameStats[team].splits.categories.find(c => c.name == 'passing').athletes[athlete].statistics.$ref);
                                    const playerID = relevancyKey.startersArray.find(s => s.espnID == athleteID).playerID;

                                    if(passerStats && passerStats.length > 1) {
                                        const passingStats = processPassing(playerID, passerStats, gameStats[otherTeam].splits.categories.find(c => c.abbreviation == 'defint').stats);
                                        
                                        if(!runningTotals[playerID]) {
                                            runningTotals[playerID] = passingStats;
                                            runningTotals[playerID].pos = relevancyKey.startersArray.find(s => s.espnID == athleteID).pos;

                                            const generalStats = processGeneral(playerID, passerStats, totalSnaps[team]);
                                            runningTotals[playerID].fpts += generalStats.fpts;
                                            runningTotals[playerID].info.general = generalStats.info.general;
                                            for(const genStat of generalStats.stats) {
                                                runningTotals[playerID].stats.push(genStat);
                                            }
                                        } else {
                                            runningTotals[playerID].fpts += passingStats.fpts;
                                            runningTotals[playerID].info.passing = passingStats.info.passing;
                                            for(const genStat of passingStats.stats) {
                                                runningTotals[playerID].stats.push(genStat);
                                            }
                                        }
                                        
                                    }
                                }
                            }
                            for(const athlete in gameStats[team].splits.categories.find(c => c.name == 'rushing').athletes) {
                                const linkType = 'player';
                                const athleteID = parseEspnTeamID(gameStats[team].splits.categories.find(c => c.name == 'rushing').athletes[athlete].athlete.$ref, linkType);

                                if(relevancyKey.startersArray.find(s => s.espnID == athleteID)) {
                                    const rusherStats = await getPlayerStats(gameStats[team].splits.categories.find(c => c.name == 'rushing').athletes[athlete].statistics.$ref);
                                    const playerID = relevancyKey.startersArray.find(s => s.espnID == athleteID).playerID;

                                    if(rusherStats && rusherStats.length > 1) {
                                        const rushingStats = processRushing(playerID, rusherStats);

                                        if(!runningTotals[playerID]) {
                                            runningTotals[playerID] = rushingStats;
                                            runningTotals[playerID].pos = relevancyKey.startersArray.find(s => s.espnID == athleteID).pos;

                                            const generalStats = processGeneral(playerID, rusherStats, totalSnaps[team]);
                                            runningTotals[playerID].fpts += generalStats.fpts;
                                            runningTotals[playerID].info.general = generalStats.info.general;
                                            for(const genStat of generalStats.stats) {
                                                runningTotals[playerID].stats.push(genStat);
                                            }
                                        } else {
                                            runningTotals[playerID].fpts += rushingStats.fpts;
                                            runningTotals[playerID].info.rushing = rushingStats.info.rushing;
                                            for(const genStat of rushingStats.stats) {
                                                runningTotals[playerID].stats.push(genStat);
                                            }
                                        }
                                    }
                                }
                            }
                            for(const athlete in gameStats[team].splits.categories.find(c => c.name == 'receiving').athletes) {
                                const linkType = 'player';
                                const athleteID = parseEspnTeamID(gameStats[team].splits.categories.find(c => c.name == 'receiving').athletes[athlete].athlete.$ref, linkType);

                                if(relevancyKey.startersArray.find(s => s.espnID == athleteID)) {
                                    const receiverStats = await getPlayerStats(gameStats[team].splits.categories.find(c => c.name == 'receiving').athletes[athlete].statistics.$ref);
                                    const playerID = relevancyKey.startersArray.find(s => s.espnID == athleteID).playerID;

                                    if(receiverStats && receiverStats.length > 1) {
                                        const receivingStats = processReceiving(playerID, receiverStats);

                                        if(!runningTotals[playerID]) {
                                            runningTotals[playerID] = receivingStats;
                                            runningTotals[playerID].pos = relevancyKey.startersArray.find(s => s.espnID == athleteID).pos;

                                            const generalStats = processGeneral(playerID, receiverStats, totalSnaps[team]);
                                            runningTotals[playerID].fpts += generalStats.fpts;
                                            runningTotals[playerID].info.general = generalStats.info.general;
                                            for(const genStat of generalStats.stats) {
                                                runningTotals[playerID].stats.push(genStat);
                                            }
                                        } else {
                                            runningTotals[playerID].fpts += receivingStats.fpts;
                                            runningTotals[playerID].info.receiving = receivingStats.info.receiving;
                                            for(const genStat of receivingStats.stats) {
                                                runningTotals[playerID].stats.push(genStat);
                                            }
                                        }                              
                                    }
                                }
                            }
                            if(kickerEnabled == true) {
                                for(const athlete in gameStats[team].splits.categories.find(c => c.name == 'kicking').athletes) {
                                    const linkType = 'player';
                                    const athleteID = parseEspnTeamID(gameStats[team].splits.categories.find(c => c.name == 'kicking').athletes[athlete].athlete.$ref, linkType);

                                    if(relevancyKey.startersArray.find(s => s.espnID == athleteID)) {
                                        const kickerStats = await getPlayerStats(gameStats[team].splits.categories.find(c => c.name == 'kicking').athletes[athlete].statistics.$ref);
                                        const playerID = relevancyKey.startersArray.find(s => s.espnID == athleteID).playerID;

                                        if(kickerStats && kickerStats.length > 1) {
                                            const kickingStats = processKicker(playerID, kickerStats.find(c => c.name == 'kicking').stats);
                                        
                                            if(!runningTotals[playerID]) {
                                                runningTotals[playerID] = kickingStats;
                                                runningTotals[playerID].pos = relevancyKey.startersArray.find(s => s.espnID == athleteID).pos;

                                                const generalStats = processGeneral(playerID, kickerStats, totalSnaps[team]);
                                                runningTotals[playerID].info.general = generalStats.info.general;
                                                runningTotals[playerID].fpts += generalStats.fpts;
                                                for(const genStat of generalStats.stats) {
                                                    runningTotals[playerID].stats.push(genStat);
                                                }
                                            } else {
                                                runningTotals[playerID].fpts += kickingStats.fpts;
                                                runningTotals[playerID].info.kicking = kickingStats.info.kicking;
                                                for(const genStat of kickingStats.stats) {
                                                    runningTotals[playerID].stats.push(genStat);
                                                }
                                            }                                 
                                        }
                                    }
                                }
                            }
                            if(idpEnabled == true) {
                                const idpPlayers = relevancyKey.startersArray.filter(s => (s.t == homeEspn || s.t == awayEspn) && (s.pos == 'DL' || s.pos == 'DB' || s.pos == 'LB'));

                                for(const athlete in gameStats[team].splits.categories.find(c => c.name == 'defensive').athletes) {
                                    const linkType = 'player';
                                    const athleteID = parseEspnTeamID(gameStats[team].splits.categories.find(c => c.name == 'defensive').athletes[athlete].athlete.$ref, linkType);

                                    if(idpPlayers.find(s => s.espnID == athleteID)) {
                                        const playerStats = await getPlayerStats(gameStats[team].splits.categories.find(c => c.name == 'defensive').athletes[athlete].statistics.$ref);
                                        const playerID = idpPlayers.find(s => s.espnID == athleteID).playerID;

                                        if(playerStats && playerStats.length > 1) {
                                            const idpPlayerStats = processIDP(playerID, playerStats.find(c => c.name == 'defensive').stats);

                                            if(!runningTotals[playerID]) {
                                                runningTotals[playerID] = idpPlayerStats;
                                                runningTotals[playerID].pos = idpPlayers.find(s => s.espnID == athleteID).pos;

                                                const generalStats = processGeneral(playerID, playerStats, totalSnaps[team]);
                                                runningTotals[playerID].fpts += generalStats.fpts;
                                                runningTotals[playerID].info.general = generalStats.info.general;
                                                for(const genStat of generalStats.stats) {
                                                    runningTotals[playerID].stats.push(genStat);
                                                }
                                            } else {
                                                runningTotals[playerID].fpts += idpPlayerStats.fpts;
                                                runningTotals[playerID].info.idp = idpPlayerStats.info.idp;
                                                for(const genStat of idpPlayerStats.stats) {
                                                    runningTotals[playerID].stats.push(genStat);
                                                }
                                            }                         
                                        }
                                    }
                                }
                            }
                        }                        
                    }
            
                    if(playByPlayData && playByPlayData.length) {
                        // set key to number of API pages for the full PBP
                        let recencyKey = playByPlayData.length;                
                        // start with first page
                        for(let j = 0; j < recencyKey; j++) {
                            let playsData = playByPlayData[j].items;
                            // start with first play on page
                            for(let k = 0; k < playsData.length; k++) {
                                let play = playsData[k];
                                // find which team made the play (checking team of first play participant is most/only reliably correct way)
                                let playTeam, linkType;
                                if(play.participants && play.participants[0].athlete) {
                                    linkType = 'participants';
                                    playTeam = parseEspnTeamID(play.participants[0].athlete.$ref, linkType, weekSelection, yearSelection);
                                } else {
                                    linkType = 'play';
                                    playTeam = parseEspnTeamID(play.team.$ref, linkType, weekSelection, yearSelection);
                                }
                                let oppTeam = playTeam == homeEspn ? awayEspn : homeEspn;
                                // flagging penalty-negated plays
                                const playType = play.type?.id || 0;
                                const noPlay = checkNoPlay(playType, play.alternativeText);
                                // flagging scoring plays & tracking DEF points allowed
                                let scoringPlay = false;
                                let scoreAgainstDEF = false;
                                let scoreAgainstOppDEF = false;
                                let scoreValueAgainstDEF = 0;
                                let scoreValueAgainstOppDEF = 0;
                                let scoringType = null;
                                let pointAfterType = null;
                                let scoreValue = 0;
                                if(play.scoreValue > 0) {
                                    scoringPlay = true;
                                    scoringType = play.scoringType.name;
                                    scoringType = play.scoringType.name;
                                    if(scoringType == 'touchdown') {
                                        if(play.pointAfterAttempt) {
                                            pointAfterType = play.pointAfterAttempt.id;
                                            if((pointAfterType == 15 || pointAfterType == 16) && play.pointAfterAttempt.value == 0) pointAfterType = -1        // MY id for failed 2-pt conversion
                                        } else {
                                            if(play.alternativeText.includes('Kick)')) {
                                                pointAfterType = 61;
                                            } else if(play.alternativeText.includes('PAT failed')) {
                                                pointAfterType = 62;
                                            } else if(play.alternativeText.includes('PAT blocked')) {
                                                pointAfterType = 43;
                                            } else if(play.alternativeText.includes('TWO-POINT') && !play.alternativeText.includes('DEFENSIVE TWO-POINT') && play.alternativeText.includes('SUCCEEDS')) {
                                                let twoPointText = play.alternativeText.slice(play.alternativeText.indexOf('TWO-POINT'));
                                                if(twoPointText.includes('rush')) {
                                                    pointAfterType = 16;
                                                } else {
                                                    pointAfterType = 15;
                                                }
                                            } else if(play.alternativeText.includes('DEFENSIVE TWO-POINT') && play.alternativeText.includes('Blocked') ) {
                                                pointAfterType = 0;
                                            } else if(play.alternativeText.includes('Conversion Failed')) {
                                                pointAfterType = -1;
                                            } 
                                        }
                                    }
                                    if(play.scoreValue == 6 && pointAfterType == 61) {
                                        scoreValue = 7;
                                    } else if(play.scoreValue == 6 && (pointAfterType == 15 || pointAfterType == 16)) {
                                        scoreValue = 8;
                                    } else {
                                        scoreValue = play.scoreValue;
                                    }
                                    if(defenseEnabled == true) {
                                        if(playType == 17 || playType == 37 || playType == 32 || playType == 57) {        // TO-DO add field goal kick 6 & 2pt return score
                                            scoreAgainstDEF = false;
                                            scoreAgainstOppDEF = true;
                                            if(playTeam == homeEspn) {
                                                homeDefPtsAllowed += scoreValue;
                                            } else {
                                                awayDefPtsAllowed += scoreValue;
                                            }
                                            scoreValueAgainstOppDEF = scoreValue;
                                        } else if(playType == 36 || playType == 39 || playType == 29 || playType == 20) {     // pick 6 / fumble 6
                                            if(scoreValue == 6 || scoreValue == 2) {
                                                scoreAgainstDEF = false;
                                                scoreAgainstOppDEF = false;
                                            } else if(scoreValue > 6) {
                                                scoreAgainstDEF = true;
                                                scoreAgainstOppDEF = false;
                                                if(playTeam == homeEspn) {
                                                    awayDefPtsAllowed += scoreValue - 6;
                                                } else {
                                                    homeDefPtsAllowed += scoreValue - 6;
                                                }
                                                scoreValueAgainstDEF = scoreValue - 6;
                                            }
                                        } else {
                                            scoreAgainstDEF = true;
                                            scoreAgainstOppDEF = false;
                                            if(playTeam == homeEspn) {
                                                awayDefPtsAllowed += scoreValue;
                                            } else {
                                                homeDefPtsAllowed += scoreValue;
                                            }
                                            scoreValueAgainstDEF = scoreValue;
                                        }
                                    }
                                }
                                // the play object with all necessary info
                                const playEntry = {
                                    playID: play.id,
                                    order: parseInt(play.sequenceNumber),
                                    playType: playType,
                                    team: playTeam,
                                    oppTeam,
                                    description: play.alternativeText,
                                    secondDescription: play.shortAlternativeText,
                                    scoringPlay,
                                    scoringType,
                                    pointAfterType,
                                    scoreValue,
                                    scoreValueAgainstDEF,
                                    scoreValueAgainstOppDEF,
                                    yards: play.statYardage,
                                    relevantPlayers: [],
                                    relevantDEF: [],
                                    scoreAgainstDEF,
                                    scoreAgainstOppDEF,
                                    noPlay,
                                    penalty: false,
                                    penaltyInfo: null,
                                    injuredStarter: false,
                                    injuryInfo: [],
                                }
                                // flagging injuries
                                if(play.alternativeText.includes('injured')) {
                                    let injuredPlayer = checkInjury(play.alternativeText, relevancyKey.startersArray);
                                    if(injuredPlayer != null) {
                                        playEntry.injuredStarter = true;
                                        playEntry.injuryInfo.push(injuredPlayer);
                                    }
                                }
                                // get penalty info
                                if(noPlay == false && play.alternativeText.includes('PENALTY') && play.alternativeText.includes('enforced')) {
                                    let truePenaltyInfo = getTruePenalty(playTeam, oppTeam, play.alternativeText, play.shortAlternativeText, playType, play.statYardage);
                                    playEntry.penalty = true;
                                    playEntry.penaltyInfo = truePenaltyInfo;
                                }
                                // process DEF yards allowed
                                if(defenseEnabled == true && noPlay == false && (homeDefStarted == true || awayDefStarted == true)) {
                                    let defensiveYardsInfo = defensiveYards(homeEspn, awayEspn, homeDefStarted, homeDefYdsAllowed, awayDefStarted, awayDefYdsAllowed, playEntry);
                                    awayDefYdsAllowed = defensiveYardsInfo.newAwayYards;
                                    homeDefYdsAllowed = defensiveYardsInfo.newHomeYards;
                                    if(defensiveYardsInfo.defYdsThreshBreakers.length > 0) {
                                        for(const breaker of defensiveYardsInfo.defYdsThreshBreakers) {
                                            defYdsThreshBreakers.push(breaker);
                                        }
                                    }
                                }

                                // flagging plays relevant to starters
                                if(noPlay == false && play.participants) {

                                    // loop thru every player involved in play
                                    for(const playerKey in play.participants) {

                                        // skip play participants that aren't scored
                                        if((play.participants[playerKey].type == 'tackler' && !score.idp_tkl && !score.idp_tkl_loss && !score.idp_tkl_solo && !score.tkl && !score.tkl_loss && !score.tkl_solo && !score.def_st_tkl_solo && !score.st_tkl_solo && !score.bonus_tkl_10p)
                                            || (play.participants[playerKey].type == 'assistedBy' && !score.idp_tkl_ast && score.tkl_ast)) {
                                            continue;
                                        }

                                        // which team is player on
                                        let linkType = 'player';
                                        let espnPlayerID = parseEspnTeamID(play.participants[playerKey].athlete.$ref, linkType, weekSelection, yearSelection);
                                        let sleeperMatch;
                                        linkType = 'participants';
                                        let playerTeam = parseEspnTeamID(play.participants[playerKey].athlete.$ref, linkType, weekSelection, yearSelection);

                                        for(const recordManID in relevancyKey.starters) {
                                            if(relevancyKey.starters[recordManID].find(s => s.espnID == espnPlayerID)) {
                                                sleeperMatch = relevancyKey.starters[recordManID].find(s => s.espnID == espnPlayerID);
                                                break;
                                            }
                                        }
                                        // if the current player involved in the play is a starter, we combine the sleeper and espn info for their entry in the playEntry
                                        if(sleeperMatch) {

                                            const relevantEntry = {
                                                playerInfo: sleeperMatch,
                                                manager: sleeperMatch.owner,
                                                statType: play.participants[playerKey].type,
                                                yards: play.statYardage, 
                                                playType: playType,
                                                playerTeam,
                                            }
                                            playEntry.relevantPlayers.push(relevantEntry);
                                        } 
                                        // flagging DEF-relevant plays
                                        if(defenseEnabled == true && (homeDefStarted == true || awayDefStarted == true)) {
                                            let relevantDefEntry = isDefRelevant(play, playType, playTeam, homeDefStarted, awayDefStarted, homeEspn, awayEspn, homeDefense, awayDefense, playerKey, playerTeam);
                                            if(relevantDefEntry) playEntry.relevantDEF.push(relevantDefEntry);
                                        }
                                    }
                                    // only push on plays involving starters, and not called back for penalty (deal with those separately)
                                    if(noPlay == false && (playEntry.relevantPlayers.length > 0 || playEntry.relevantDEF.length >  0 || playEntry.scoringPlay == true || playEntry.injuredStarter == true)) {
                                        fantasyRelevantPlaysForward.push(playEntry);
                                    } 
                                }
                            }
                        }
                        if(defenseEnabled == true) {

                            // IF DEF is started && IF stats count, loop thru drives API to flag 4th down stops, 3 & outs, etc
                            if((gameState == 'in' || gameState == 'post') && (homeDefStarted == true || awayDefStarted == true) && (score.def_3_and_out || (score.def_4_and_stop && turnoverOnDowns == true))) { 
                                let drivesData = await getGameDrives(relevancyKey.games[gameSelect], true).catch((err) => { console.error(err); });
                                if(drivesData) {
                                    let drivesKey = drivesData.length;

                                    for(let d = 0; d < drivesKey; d++) {
                                        let driveData = drivesData[d].items;

                                        for(let e = 0; e < driveData.length; e++) {
                                            let drive = driveData[e];
                                            
                                            if(score.def_3_and_out && drive.offensivePlays == 3 && drive.result == 'PUNT') {
                                                let lastPlay = drive.plays.items[drive.plays.items.length - 1];
                                                if(!lastPlay.participants) {
                                                    lastPlay = drive.plays.items[drive.plays.items.length - 2];
                                                }
                                                let linkType = 'participants';
                                                let playTeam = parseEspnTeamID(lastPlay.participants[0].athlete.$ref, linkType, weekSelection, yearSelection);
                                                let oppTeam;
                                                let defense;

                                                if((playTeam == homeEspn && awayDefStarted == false) || (playTeam == awayEspn && homeDefStarted == false)) {
                                                    continue;
                                                } else {
                                                    if(playTeam == homeEspn) {
                                                        oppTeam = awayEspn;
                                                        defense = awayDefense;
                                                    } else {
                                                        oppTeam = homeEspn;
                                                        defense = homeDefense;
                                                    }
                                                }
                                                // the play object with all necessary info
                                                const playEntry = {
                                                    playID: lastPlay.id,
                                                    order: parseInt(lastPlay.sequenceNumber),
                                                    playType: '3andout',
                                                    team: playTeam,
                                                    oppTeam,
                                                    description: lastPlay.alternativeText,
                                                    secondDescription: lastPlay.shortAlternativeText,
                                                    scoringPlay: false,
                                                    scoringType: null,
                                                    pointAfterType: null,
                                                    scoreValue: 0,
                                                    scoreValueAgainstDEF: 0,
                                                    scoreValueAgainstOppDEF: 0,
                                                    yards: lastPlay.statYardage,
                                                    relevantPlayers: [],
                                                    relevantDEF: [],
                                                    scoreAgainstDEF: false,
                                                    scoreAgainstOppDEF: false,
                                                    noPlay: false,
                                                    penalty: false,
                                                    penaltyInfo: null,
                                                    injuredStarter: false,
                                                    injuryInfo: [],
                                                }

                                                const relevantEntry = {
                                                    playerInfo: defense,
                                                    manager: defense.owner,
                                                    statType: lastPlay.participants[0].type,
                                                    yards: lastPlay.statYardage, 
                                                    playType: '3andout',
                                                    oppDef: playTeam,
                                                }
                                                playEntry.relevantDEF.push(relevantEntry);
                                                fantasyRelevantPlaysForward.push(playEntry);
                                            } else if(turnoverOnDowns == true && score.def_4_and_stop && drive.result == 'DOWNS') {
                                                let lastPlay = drive.plays.items[drive.plays.items.length - 1];
                                                if(!lastPlay.participants) {
                                                    lastPlay = drive.plays.items[drive.plays.items.length - 2];
                                                }
                                                let linkType = 'participants';
                                                let playTeam = parseEspnTeamID(lastPlay.participants[0].athlete.$ref, linkType, weekSelection, yearSelection);
                                                let oppTeam;
                                                let defense;

                                                if((playTeam == homeEspn && awayDefStarted == false) || (playTeam == awayEspn && homeDefStarted == false)) {
                                                    continue;
                                                } else {
                                                    if(playTeam == homeEspn) {
                                                        oppTeam = awayEspn;
                                                        defense = awayDefense;
                                                    } else {
                                                        oppTeam = homeEspn;
                                                        defense = homeDefense;
                                                    }
                                                }
                                                // the play object with all necessary info
                                                const playEntry = {
                                                    playID: lastPlay.id,
                                                    order: parseInt(lastPlay.sequenceNumber),
                                                    playType: '4thdown',
                                                    team: playTeam,
                                                    oppTeam,
                                                    description: lastPlay.alternativeText,
                                                    scoringPlay: false,
                                                    scoringType: null,
                                                    pointAfterType: null,
                                                    scoreValue: 0,
                                                    scoreValueAgainstDEF: 0,
                                                    scoreValueAgainstOppDEF: 0,
                                                    yards: lastPlay.statYardage,
                                                    relevantPlayers: [],
                                                    relevantDEF: [],
                                                    scoreAgainstDEF: false,
                                                    scoreAgainstOppDEF: false,
                                                    noPlay: false,
                                                    penalty: false,
                                                    penaltyInfo: null,
                                                    injuredStarter: false,
                                                    injuryInfo: [],
                                                }

                                                const relevantEntry = {
                                                    playerInfo: defense,
                                                    manager: defense.owner,
                                                    statType: lastPlay.participants[0].type,
                                                    yards: lastPlay.statYardage, 
                                                    playType: '4thdown',
                                                    oppDef: playTeam,
                                                }
                                                playEntry.relevantDEF.push(relevantEntry);
                                                fantasyRelevantPlaysForward.push(playEntry);
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        let fantasyRelevantPlays = fantasyRelevantPlaysForward.slice().reverse();
                        let fantasyProducts_matchGame = processPlays(fantasyRelevantPlays, defYdsThreshBreakers, homeDefStarted, awayDefStarted, homeEspn, awayEspn, homeDefense, awayDefense, homeDefPtsAllowed, awayDefPtsAllowed, gameState, relevancyKey.startersArray);

                        for(const product of fantasyProducts_matchGame) {
                            fantasyProducts_match.push(product);
                        }
                    }
                
                    fantasyProducts = fantasyProducts_match;
                    fantasyProducts = fantasyProducts.filter(p => p.length > 0);
                    fantasyProducts = fantasyProducts.sort((a, b) => b[0]?.order - a[0]?.order);
                }
            }
            // nfl game play by play
        } else if(showGameBox == true) {

            runningTotals = {};

            let playByPlayData = gameSelection ? await getPlayByPlay(gameSelection).catch((err) => { console.error(err); }) : await getPlayByPlay(nflMatchups[0][0].gameID).catch((err) => { console.error(err); });
            let fantasyRelevantPlaysForward = [];
            let defYdsThreshBreakers = [];
            // startersArray will help us match our sleeper playerInfo to espn player APIs, and also check if someone is starting one of the DEFs
            startersArray = [];

            for(const recordManID in fantasyStarters) {
                const starters = fantasyStarters[recordManID].starters;

                for(const starter of starters) {
                    if(starter != '0') {
                        const starterInfo = nflPlayerInfo[starter];
                        const starterEntry = {
                            playerID: starter,
                            espnID: playersInfo.players[starter].pos == 'DEF' ? null : playersInfo.players[starter].espnID ? playersInfo.players[starter].espnID : starterInfo.espn.id,
                            rosterSpot: positions[starters.indexOf(starter)],
                            owner: managerInfo[recordManID],
                            fn: playersInfo.players[starter].pos == 'DEF' ? nflTeams.find(t => t.sleeperID == starter).ln : playersInfo.players[starter].fn,
                            ln: playersInfo.players[starter].pos == 'DEF' ? 'Defense' : playersInfo.players[starter].ln,
                            pos: playersInfo.players[starter].pos,
                            t: playersInfo.players[starter].pos == 'DEF' ? nflTeams.find(t => t.sleeperID == starter).espnAbbreviation : starterInfo && starterInfo.espn.t[yearSelection].length > 1 && starterInfo.espn.t[yearSelection].find(w => w.firstWeek <= weekSelection && w.lastWeek >= weekSelection) ? starterInfo.espn.t[yearSelection].find(w => w.firstWeek <= weekSelection && w.lastWeek >= weekSelection).team : playersInfo.players[starter].wi[yearSelection][weekSelection] && playersInfo.players[starter].wi[yearSelection][weekSelection].t ? nflTeams.find(t => t.sleeperID == playersInfo.players[starter].wi[yearSelection][weekSelection].t).espnAbbreviation : starterInfo ? starterInfo.espn.t[yearSelection][0] : 'NONE',
                            avatar: playersInfo.players[starter].pos == 'DEF' ? `https://sleepercdn.com/images/team_logos/nfl/${starter.toLowerCase()}.png` : `https://sleepercdn.com/content/nfl/players/thumb/${starter}.jpg`,
                        }
                        startersArray.push(starterEntry);
                    }
                }
            }
            
            // identify NFL teams in the current game
            let game = gameSelection ? nflMatchups.find(m => m[0].gameID == gameSelection) : nflMatchups[0];
            let gameState = game[0].status.type.state;

            let espnTeamIDs = [];
            let home = game[0].sleeperID;
            let homeEspn = game[0].team.espnAbbreviation;
            espnTeamIDs.push(game[0].team.espnID);
            let homeDefense = null;

            let away = game[1].sleeperID;
            let awayEspn = game[1].team.espnAbbreviation;
            espnTeamIDs.push(game[1].team.espnID);
            let awayDefense = null;

            let homeDefStarted = false;
            let awayDefStarted = false;
            let turnoverOnDowns = false;

            let homeDefPtsAllowed = 0;
            let awayDefPtsAllowed = 0;
            let homeDefYdsAllowed = 0;
            let awayDefYdsAllowed = 0;

            // check if either DEF is being started
            if(defenseEnabled == true) {
                if(startersArray.find(s => s.playerID == home)) {
                    homeDefStarted = true;
                    homeDefense = startersArray.find(s => s.playerID == home);
                }
                if(startersArray.find(s => s.playerID == away)) {
                    awayDefStarted = true;
                    awayDefense = startersArray.find(s => s.playerID == away);
                }
            }

            // calculate total fpts that can be gathered from espn stat summaries
            if(gameState == 'in' || gameState == 'post') {
                const gameStats = await getGameStats(game[0].gameID, espnTeamIDs);

                if(gameStats.home) {

                    const totalSnaps = {};
                    if(defenseEnabled == true) {
                        if(homeDefStarted == true) {
                            runningTotals[home] = processDefense(home, gameStats.home.splits.categories, gameStats.away.splits.categories);
                            runningTotals[home].pos = 'DEF';
                        }
                        if(awayDefStarted == true) {
                            runningTotals[away] = processDefense(away, gameStats.away.splits.categories, gameStats.home.splits.categories);
                            runningTotals[away].pos = 'DEF';
                        }
                        if((runningTotals[home] && runningTotals[home].stats.find(s => s.statDesc == 'def_4_and_stop')) || (runningTotals[away] && runningTotals[away].stats.find(s => s.statDesc == 'def_4_and_stop'))) {
                            turnoverOnDowns = true;
                        }
                    }

                    for(const team in gameStats) {

                        let otherTeam = team == 'home' ? 'away' : 'home';

                        totalSnaps[team] = gameStats[team].splits.categories.find(c => c.stats.find(s => s.abbreviation == 'OP')).stats.find(a => a.abbreviation == 'OP').value;

                        for(const athlete in gameStats[team].splits.categories.find(c => c.name == 'passing').athletes) {
                            const linkType = 'player';
                            const athleteID = parseEspnTeamID(gameStats[team].splits.categories.find(c => c.name == 'passing').athletes[athlete].athlete.$ref, linkType);

                            if(startersArray.find(s => s.espnID == athleteID)) {
                                const passerStats = await getPlayerStats(gameStats[team].splits.categories.find(c => c.name == 'passing').athletes[athlete].statistics.$ref);
                                const playerID = startersArray.find(s => s.espnID == athleteID).playerID;

                                if(passerStats && passerStats.length > 1) {
                                    const passingStats = processPassing(playerID, passerStats, gameStats[otherTeam].splits.categories.find(c => c.abbreviation == 'defint').stats);
                                    
                                    if(!runningTotals[playerID]) {
                                        runningTotals[playerID] = passingStats;
                                        runningTotals[playerID].pos = startersArray.find(s => s.espnID == athleteID).pos;

                                        const generalStats = processGeneral(playerID, passerStats, totalSnaps[team]);
                                        runningTotals[playerID].info.general = generalStats.info.general;
                                        runningTotals[playerID].fpts += generalStats.fpts;
                                        for(const genStat of generalStats.stats) {
                                            runningTotals[playerID].stats.push(genStat);
                                        }
                                    } else {
                                        runningTotals[playerID].fpts += passingStats.fpts;
                                        runningTotals[playerID].info.passing = passingStats.info.passing;
                                        for(const genStat of passingStats.stats) {
                                            runningTotals[playerID].stats.push(genStat);
                                        }
                                    }
                                    
                                }
                            }
                        }
                        for(const athlete in gameStats[team].splits.categories.find(c => c.name == 'rushing').athletes) {
                            const linkType = 'player';
                            const athleteID = parseEspnTeamID(gameStats[team].splits.categories.find(c => c.name == 'rushing').athletes[athlete].athlete.$ref, linkType);

                            if(startersArray.find(s => s.espnID == athleteID)) {
                                const rusherStats = await getPlayerStats(gameStats[team].splits.categories.find(c => c.name == 'rushing').athletes[athlete].statistics.$ref);
                                const playerID = startersArray.find(s => s.espnID == athleteID).playerID;

                                if(rusherStats && rusherStats.length > 1) {
                                    const rushingStats = processRushing(playerID, rusherStats);

                                    if(!runningTotals[playerID]) {
                                        runningTotals[playerID] = rushingStats;
                                        runningTotals[playerID].pos = startersArray.find(s => s.espnID == athleteID).pos;

                                        const generalStats = processGeneral(playerID, rusherStats, totalSnaps[team]);
                                        runningTotals[playerID].info.general = generalStats.info.general;
                                        runningTotals[playerID].fpts += generalStats.fpts;
                                        for(const genStat of generalStats.stats) {
                                            runningTotals[playerID].stats.push(genStat);
                                        }
                                    } else {
                                        runningTotals[playerID].fpts += rushingStats.fpts;
                                        runningTotals[playerID].info.rushing = rushingStats.info.rushing;
                                        for(const genStat of rushingStats.stats) {
                                            runningTotals[playerID].stats.push(genStat);
                                        }
                                    }
                                }
                            }
                        }
                        for(const athlete in gameStats[team].splits.categories.find(c => c.name == 'receiving').athletes) {
                            const linkType = 'player';
                            const athleteID = parseEspnTeamID(gameStats[team].splits.categories.find(c => c.name == 'receiving').athletes[athlete].athlete.$ref, linkType);

                            if(startersArray.find(s => s.espnID == athleteID)) {
                                const receiverStats = await getPlayerStats(gameStats[team].splits.categories.find(c => c.name == 'receiving').athletes[athlete].statistics.$ref);
                                const playerID = startersArray.find(s => s.espnID == athleteID).playerID;

                                if(receiverStats && receiverStats.length > 1) {
                                    const receivingStats = processReceiving(playerID, receiverStats);

                                    if(!runningTotals[playerID]) {
                                        runningTotals[playerID] = receivingStats;
                                        runningTotals[playerID].pos = startersArray.find(s => s.espnID == athleteID).pos;

                                        const generalStats = processGeneral(playerID, receiverStats, totalSnaps[team]);
                                        runningTotals[playerID].info.general = generalStats.info.general;
                                        runningTotals[playerID].fpts += generalStats.fpts;
                                        for(const genStat of generalStats.stats) {
                                            runningTotals[playerID].stats.push(genStat);
                                        }
                                    } else {
                                        runningTotals[playerID].fpts += receivingStats.fpts;
                                        runningTotals[playerID].info.receiving = receivingStats.info.receiving;
                                        for(const genStat of receivingStats.stats) {
                                            runningTotals[playerID].stats.push(genStat);
                                        }
                                    }                              
                                }
                            }
                        }
                        if(kickerEnabled == true) {
                            for(const athlete in gameStats[team].splits.categories.find(c => c.name == 'kicking').athletes) {
                                const linkType = 'player';
                                const athleteID = parseEspnTeamID(gameStats[team].splits.categories.find(c => c.name == 'kicking').athletes[athlete].athlete.$ref, linkType);

                                if(startersArray.find(s => s.espnID == athleteID)) {
                                    const kickerStats = await getPlayerStats(gameStats[team].splits.categories.find(c => c.name == 'kicking').athletes[athlete].statistics.$ref);
                                    const playerID = startersArray.find(s => s.espnID == athleteID).playerID;

                                    if(kickerStats && kickerStats.length > 1) {
                                        const kickingStats = processKicker(playerID, kickerStats.find(c => c.name == 'kicking').stats);
                                    
                                        if(!runningTotals[playerID]) {
                                            runningTotals[playerID] = kickingStats;
                                            runningTotals[playerID].pos = startersArray.find(s => s.espnID == athleteID).pos;

                                            const generalStats = processGeneral(playerID, kickerStats, totalSnaps[team]);
                                            runningTotals[playerID].fpts += generalStats.fpts;
                                            runningTotals[playerID].info.general = generalStats.info.general;
                                            for(const genStat of generalStats.stats) {
                                                runningTotals[playerID].stats.push(genStat);
                                            }
                                        } else {
                                            runningTotals[playerID].fpts += kickingStats.fpts;
                                            runningTotals[playerID].info.kicking = kickingStats.info.kicking;
                                            for(const genStat of kickingStats.stats) {
                                                runningTotals[playerID].stats.push(genStat);
                                            }
                                        }                                 
                                    }
                                }
                            }
                        }
                        if(idpEnabled == true) {
                            const idpPlayers = startersArray.filter(s => (s.t == homeEspn || s.t == awayEspn) && (s.pos == 'DL' || s.pos == 'DB' || s.pos == 'LB'));

                            for(const athlete in gameStats[team].splits.categories.find(c => c.name == 'defensive').athletes) {
                                const linkType = 'player';
                                const athleteID = parseEspnTeamID(gameStats[team].splits.categories.find(c => c.name == 'defensive').athletes[athlete].athlete.$ref, linkType);

                                if(idpPlayers.find(s => s.espnID == athleteID)) {
                                    const playerStats = await getPlayerStats(gameStats[team].splits.categories.find(c => c.name == 'defensive').athletes[athlete].statistics.$ref);
                                    const playerID = idpPlayers.find(s => s.espnID == athleteID).playerID;

                                    if(playerStats && playerStats.length > 1) {
                                        const idpPlayerStats = processIDP(playerID, playerStats.find(c => c.name == 'defensive').stats);

                                        if(!runningTotals[playerID]) {
                                            runningTotals[playerID] = idpPlayerStats;
                                            runningTotals[playerID].pos = idpPlayers.find(s => s.espnID == athleteID).pos;

                                            const generalStats = processGeneral(playerID, playerStats, totalSnaps[team]);
                                            runningTotals[playerID].info.general = generalStats.info.general;
                                            runningTotals[playerID].fpts += generalStats.fpts;
                                            for(const genStat of generalStats.stats) {
                                                runningTotals[playerID].stats.push(genStat);
                                            }
                                        } else {
                                            runningTotals[playerID].fpts += idpPlayerStats.fpts;
                                            runningTotals[playerID].info.idp = idpPlayerStats.info.idp;
                                            for(const genStat of idpPlayerStats.stats) {
                                                runningTotals[playerID].stats.push(genStat);
                                            }
                                        }                         
                                    }
                                }
                            }
                        }
                    }                        
                }
            

                if(playByPlayData && playByPlayData.length) {
                    // set key to number of API pages for the full PBP
                    let recencyKey = playByPlayData.length;
                    // start with first page
                    for(let j = 0; j < recencyKey; j++) {
                        let playsData = playByPlayData[j].items;
                        // start with first play on page
                        for(let k = 0; k < playsData.length; k++) {
                            let play = playsData[k];
                            // which team made the play
                            let playTeam, linkType;
                            if(play.participants && play.participants[0].athlete) {
                                linkType = 'participants';
                                playTeam = parseEspnTeamID(play.participants[0].athlete.$ref, linkType, weekSelection, yearSelection);
                            } else {
                                linkType = 'play';
                                playTeam = parseEspnTeamID(play.team.$ref, linkType, weekSelection, yearSelection);
                            }
                            let oppTeam = playTeam == homeEspn ? awayEspn : homeEspn;

                            // flagging penalty-negated plays
                            const playType = play.type?.id || 0;
                            const noPlay = checkNoPlay(playType, play.alternativeText);
                            // flagging scoring plays & tracking DEF points allowed
                            let scoringPlay = false;
                            let scoreAgainstDEF = false;
                            let scoreAgainstOppDEF = false;
                            let scoreValueAgainstDEF = 0;
                            let scoreValueAgainstOppDEF = 0;
                            let scoringType = null;
                            let pointAfterType = null;
                            let scoreValue = 0;
                            if(play.scoreValue > 0) {
                                scoringPlay = true;
                                scoringType = play.scoringType.name;
                                if(scoringType == 'touchdown') {
                                    if(play.pointAfterAttempt) {
                                        pointAfterType = play.pointAfterAttempt.id;
                                        if((pointAfterType == 15 || pointAfterType == 16) && play.pointAfterAttempt.value == 0) {
                                            pointAfterType = -1        // MY id for failed 2-pt conversion
                                        }
                                    } else {
                                        if(play.alternativeText.includes('Kick)') || play.shortAlternativeText.includes('Kick)')) {
                                            pointAfterType = 61;
                                        } else if(play.alternativeText.includes('PAT failed')) {
                                            pointAfterType = 62;
                                        } else if(play.alternativeText.includes('PAT blocked')) {
                                            pointAfterType = 43;
                                        } else if(play.alternativeText.includes('TWO-POINT') && !play.alternativeText.includes('DEFENSIVE TWO-POINT') && play.alternativeText.includes('SUCCEEDS')) {
                                            let twoPointText = play.alternativeText.slice(play.alternativeText.indexOf('TWO-POINT'));
                                            if(twoPointText.includes('rush')) {
                                                pointAfterType = 16;
                                            } else {
                                                pointAfterType = 15;
                                            }
                                        } else if(play.alternativeText.includes('DEFENSIVE TWO-POINT') && play.alternativeText.includes('Blocked') ) {
                                            pointAfterType = 0;
                                        } else if(play.alternativeText.includes('Conversion Failed')) {
                                            pointAfterType = -1;
                                        }
                                    }
                                }
                                if(play.scoreValue == 6 && pointAfterType == 61) {
                                    scoreValue = 7;
                                } else if(play.scoreValue == 6 && (pointAfterType == 15 || pointAfterType == 16)) {
                                    scoreValue = 8;
                                } else {
                                    scoreValue = play.scoreValue;
                                }
                                if(defenseEnabled == true) {
                                    if(playType == 17 || playType == 37 || playType == 32 || playType == 57) {        // TO-DO add field goal kick 6 & 2pt return score
                                        scoreAgainstDEF = false;
                                        scoreAgainstOppDEF = true;
                                        if(playTeam == homeEspn) {
                                            homeDefPtsAllowed += scoreValue;
                                        } else {
                                            awayDefPtsAllowed += scoreValue;
                                        }
                                        scoreValueAgainstOppDEF = scoreValue;
                                    } else if(playType== 36 || playType == 39 || playType == 29 || playType == 20) {    // pick 6 / fumble 6 / safety
                                        if(scoreValue == 6 || scoreValue == 2) {
                                            scoreAgainstDEF = false;
                                            scoreAgainstOppDEF = false;
                                        } else if(scoreValue > 6) {
                                            scoreAgainstDEF = false;
                                            scoreAgainstOppDEF = true;
                                            if(playTeam == homeEspn) {
                                                homeDefPtsAllowed += scoreValue - 6;
                                            } else {
                                                awayDefPtsAllowed += scoreValue - 6;
                                            }
                                            scoreValueAgainstOppDEF = scoreValue - 6;
                                        } 
                                    } else {
                                        scoreAgainstDEF = true;
                                        scoreAgainstOppDEF = false;
                                        if(playTeam == homeEspn) {
                                            awayDefPtsAllowed += scoreValue;
                                        } else {
                                            homeDefPtsAllowed += scoreValue;
                                        }
                                        scoreValueAgainstDEF = scoreValue;
                                    }
                                }
                            }
                            // the play object with all necessary info
                            const playEntry = {
                                playID: play.id,
                                order: parseInt(play.sequenceNumber),
                                playType: playType,
                                team: playTeam,
                                oppTeam,
                                description: play.alternativeText,
                                secondDescription: play.shortAlternativeText,
                                scoringPlay,
                                scoringType,
                                pointAfterType,
                                scoreValue,
                                scoreValueAgainstDEF,
                                scoreValueAgainstOppDEF,
                                yards: play.statYardage,
                                relevantPlayers: [],
                                relevantDEF: [],
                                scoreAgainstDEF,
                                scoreAgainstOppDEF,
                                noPlay,
                                penalty: false,
                                penaltyInfo: null,
                                injuredStarter: false,
                                injuryInfo: [],
                            }
                            // flagging injuries
                            if(play.alternativeText.includes('injured')) {
                                let injuredPlayer = checkInjury(play.alternativeText, startersArray);
                                if(injuredPlayer != null) {
                                    playEntry.injuredStarter = true;
                                    playEntry.injuryInfo.push(injuredPlayer);
                                }
                            }
                            // get penalty info
                            if(noPlay == false && play.alternativeText.includes('PENALTY') && play.alternativeText.includes('enforced')) {
                                let truePenaltyInfo = getTruePenalty(playTeam, oppTeam, play.alternativeText, play.shortAlternativeText, playType, play.statYardage);
                                playEntry.penalty = true;
                                playEntry.penaltyInfo = truePenaltyInfo;
                            }
                            // process DEF yards allowed
                            if(defenseEnabled == true && noPlay == false && (homeDefStarted == true || awayDefStarted == true)) {
                                let defensiveYardsInfo = defensiveYards(homeEspn, awayEspn, homeDefStarted, homeDefYdsAllowed, awayDefStarted, awayDefYdsAllowed, playEntry);
                                awayDefYdsAllowed = defensiveYardsInfo.newAwayYards;
                                homeDefYdsAllowed = defensiveYardsInfo.newHomeYards;
                                if(defensiveYardsInfo.defYdsThreshBreakers.length > 0) {
                                    for(const breaker of defensiveYardsInfo.defYdsThreshBreakers) {
                                        defYdsThreshBreakers.push(breaker);
                                    }
                                }
                            }
                            // flagging plays relevant to starters
                            if(noPlay == false && play.participants) {
                                // loop thru every player involved in play
                                for(const playerKey in play.participants) {

                                    // skip play participants that aren't scored
                                    if((play.participants[playerKey].type == 'tackler' && !score.idp_tkl && !score.idp_tkl_loss && !score.idp_tkl_solo && !score.tkl && !score.tkl_loss && !score.tkl_solo && !score.def_st_tkl_solo && !score.st_tkl_solo && !score.bonus_tkl_10p)
                                        || (play.participants[playerKey].type == 'assistedBy' && !score.idp_tkl_ast && score.tkl_ast)) {
                                        continue;
                                    } 

                                    // which team is player on
                                    let linkType = 'player';
                                    let espnPlayerID = parseEspnTeamID(play.participants[playerKey].athlete.$ref, linkType, weekSelection, yearSelection);
                                    linkType = 'participants';
                                    let playerTeam = parseEspnTeamID(play.participants[playerKey].athlete.$ref, linkType, weekSelection, yearSelection);
                                    let sleeperMatch = startersArray?.find(s => s.espnID == espnPlayerID) || null;

                                    // if the current player involved in the play is a starter, we combine the sleeper and espn info for their entry in the playEntry
                                    if(sleeperMatch) {
                                        const relevantEntry = {
                                            playerInfo: sleeperMatch,
                                            manager: sleeperMatch.owner,
                                            statType: play.participants[playerKey].type,
                                            yards: play.statYardage, 
                                            playType: playType,
                                            playerTeam,
                                        }
                                        playEntry.relevantPlayers.push(relevantEntry);
                                    } 
                                    // flagging DEF-relevant plays
                                    if(defenseEnabled == true && (homeDefStarted == true || awayDefStarted == true)) {
                                        let relevantDefEntry = isDefRelevant(play, playType, playTeam, homeDefStarted, awayDefStarted, homeEspn, awayEspn, homeDefense, awayDefense, playerKey, playerTeam);
                                        if(relevantDefEntry) playEntry.relevantDEF.push(relevantDefEntry);      
                                    }
                                }
                                // only push on plays involving starters, and not called back for penalty (deal with those separately)
                                if(noPlay == false && (playEntry.relevantPlayers.length > 0 || playEntry.relevantDEF.length >  0 || playEntry.scoringPlay == true || playEntry.injuredStarter == true)) {
                                    fantasyRelevantPlaysForward.push(playEntry);
                                } 
                            }
                        }
                    }
                    if(defenseEnabled == true) {

                        // IF DEF is started && IF stats count, loop thru drives API to flag 4th down stops, 3 & outs, etc
                        if((gameState == 'in' || gameState == 'post') && (homeDefStarted == true || awayDefStarted == true) && (score.def_3_and_out || (score.def_4_and_stop && turnoverOnDowns == true))) { 
                            let drivesData = await getGameDrives(gameSelection, true).catch((err) => { console.error(err); });
                            if(drivesData) {
                                let drivesKey = drivesData.length;

                                for(let d = 0; d < drivesKey; d++) {
                                    let driveData = drivesData[d].items;

                                    for(let e = 0; e < driveData.length; e++) {
                                        let drive = driveData[e];
                                            
                                        if(score.def_3_and_out && drive.offensivePlays == 3 && drive.result == 'PUNT') {
                                            let lastPlay = drive.plays.items[drive.plays.items.length - 1];
                                            if(!lastPlay.participants) {
                                                lastPlay = drive.plays.items[drive.plays.items.length - 2];
                                            }
                                            let linkType = 'participants';
                                            let playTeam = parseEspnTeamID(lastPlay.participants[0].athlete.$ref, linkType, weekSelection, yearSelection);
                                            let oppTeam;
                                            let defense;

                                            if((playTeam == homeEspn && awayDefStarted == false) || (playTeam == awayEspn && homeDefStarted == false)) {
                                                continue;
                                            } else {
                                                if(playTeam == homeEspn) {
                                                    oppTeam = awayEspn;
                                                    defense = awayDefense;
                                                } else {
                                                    oppTeam = homeEspn;
                                                    defense = homeDefense;
                                                }
                                            }
                                            // the play object with all necessary info
                                            const playEntry = {
                                                playID: lastPlay.id,
                                                order: parseInt(lastPlay.sequenceNumber),
                                                playType: '3andout',
                                                team: playTeam,
                                                oppTeam,
                                                description: lastPlay.alternativeText,
                                                secondDescription: lastPlay.shortAlternativeText,
                                                scoringPlay: false,
                                                scoringType: null,
                                                pointAfterType: null,
                                                scoreValue: 0,
                                                scoreValueAgainstDEF: 0,
                                                scoreValueAgainstOppDEF: 0,
                                                yards: lastPlay.statYardage,
                                                relevantPlayers: [],
                                                relevantDEF: [],
                                                scoreAgainstDEF: false,
                                                scoreAgainstOppDEF: false,
                                                noPlay: false,
                                                penalty: false,
                                                penaltyInfo: null,
                                                injuredStarter: false,
                                                injuryInfo: [],
                                            }

                                            const relevantEntry = {
                                                playerInfo: defense,
                                                manager: defense.owner,
                                                statType: lastPlay.participants[0].type,
                                                yards: lastPlay.statYardage, 
                                                playType: '3andout',
                                                oppDef: playTeam,
                                            }
                                            playEntry.relevantDEF.push(relevantEntry);
                                            fantasyRelevantPlaysForward.push(playEntry);
                                        } else if(turnoverOnDowns == true && score.def_4_and_stop && drive.result == 'DOWNS') {
                                            let lastPlay = !lastPlay.participants ? drive.plays.items[drive.plays.items.length - 2] : drive.plays.items[drive.plays.items.length - 1];

                                            let linkType = 'participants';
                                            let playTeam = parseEspnTeamID(lastPlay.participants[0].athlete.$ref, linkType, weekSelection, yearSelection);
                                            let oppTeam;
                                            let defense;

                                            if((playTeam == homeEspn && awayDefStarted == false) || (playTeam == awayEspn && homeDefStarted == false)) {
                                                continue;
                                            } else {
                                                if(playTeam == homeEspn) {
                                                    oppTeam = awayEspn;
                                                    defense = awayDefense;
                                                } else {
                                                    oppTeam = homeEspn;
                                                    defense = homeDefense;
                                                }
                                            }
                                            // the play object with all necessary info
                                            const playEntry = {
                                                playID: lastPlay.id,
                                                order: parseInt(lastPlay.sequenceNumber),
                                                playType: '4thdown',
                                                team: playTeam,
                                                oppTeam,
                                                description: lastPlay.alternativeText,
                                                scoringPlay: false,
                                                scoringType: null,
                                                pointAfterType: null,
                                                scoreValue: 0,
                                                scoreValueAgainstDEF: 0,
                                                scoreValueAgainstOppDEF: 0,
                                                yards: lastPlay.statYardage,
                                                relevantPlayers: [],
                                                relevantDEF: [],
                                                scoreAgainstDEF: false,
                                                scoreAgainstOppDEF: false,
                                                noPlay: false,
                                                penalty: false,
                                                penaltyInfo: null,
                                                injuredStarter: false,
                                                injuryInfo: [],
                                            }

                                            const relevantEntry = {
                                                playerInfo: defense,
                                                manager: defense.owner,
                                                statType: lastPlay.participants[0].type,
                                                yards: lastPlay.statYardage, 
                                                playType: '4thdown',
                                                oppDef: playTeam,
                                            }
                                            playEntry.relevantDEF.push(relevantEntry);
                                            fantasyRelevantPlaysForward.push(playEntry);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    
                    // now that we've filtered our relevant plays, we calculate the fpts each produces
                    let fantasyRelevantPlays = fantasyRelevantPlaysForward.slice().reverse();
                    let fantasyProducts_game = processPlays(fantasyRelevantPlays, defYdsThreshBreakers, homeDefStarted, awayDefStarted, homeEspn, awayEspn, homeDefense, awayDefense, homeDefPtsAllowed, awayDefPtsAllowed, gameState, startersArray);
                    fantasyProducts = fantasyProducts_game;
                    fantasyProducts = fantasyProducts.filter(p => p.length > 0);
                    fantasyProducts = fantasyProducts.sort((a, b) => b[0]?.order - a[0]?.order);
                }
            }
        }
        return {fantasyProducts, runningTotals}; 
    }

    const displayByPlay = async (gameSelection, matchSelection, startersArray, showGameBox, showMatchBox) => {
        fantasyProducts = await loadPlayByPlay(gameSelection, matchSelection, startersArray, showGameBox, showMatchBox);
        return fantasyProducts;
    }
    $: fantasyProducts = displayByPlay(gameSelection, matchSelection, startersArray, showGameBox, showMatchBox);  
    
    const filterPlays = (fantasyProducts, leaderBoardInfo, viewPlayerID, managerSelection) => {
        let filteredProducts = fantasyProducts.fantasyProducts;
        if(leaderBoardInfo && fantasyProducts.fantasyProducts && fantasyProducts.fantasyProducts.length > 1) {

            if(leaderBoardInfo.type == 'position') {
                filteredProducts = filteredProducts.filter(p => p.some(p => leaderBoardInfo.spec.includes(p.playerInfo.rosterSpot)));
            } else if(leaderBoardInfo.type == 'matchup' && managerSelection != 0) {
                filteredProducts = filteredProducts.filter(p => p.some(p => p.playerInfo.owner.recordManID == managerSelection));
            } 

            if(viewPlayerID && viewPlayerID != 'flush') filteredProducts = filteredProducts.filter(p => p.some(p => p.playerInfo.playerID == viewPlayerID));
            filteredProducts = filteredProducts.sort((a, b) => b[0]?.order - a[0]?.order);
        }
        return filteredProducts;
    }
    $: filteredProducts = filterPlays(fantasyProducts, leaderBoardInfo, viewPlayerID, managerSelection);

    // FOR DOWNLOADING HISTORICAL PLAYER INFO TO LOCAL

    // const getEspnPlayerData = async () => {
    //     const espnPlayersInfo = {};

    //     for(const playerID in nflPlayerInfo) {
    //         const sleeper = playersInfo.players[playerID];

    //         if(sleeper.espnID == null || Object.keys(sleeper.wi).length == 0) {
    //             espnPlayersInfo[playerID] = nflPlayerInfo[playerID];
    //             continue;
    //         }

    //         for(const year in nflPlayerInfo[playerID].espn.t) {
    //             if(nflPlayerInfo[playerID].espn.t[year].length > 1) {
    //                 espnPlayersInfo[playerID] = nflPlayerInfo[playerID];
    //                 break;
    //             }
    //         }
    //     }

        // let masterID = 1;
        // for(const playerID in playersInfo.players) {
        //     if(allNflPlayerInfo.find(p => p.sleeper.id == playerID)) {
        //         const espnInfo = allNflPlayerInfo.find(p => p.sleeper.id == playerID).espn;
        
        //         espnPlayersInfo[playerID] = {
        //             id: masterID,
        //             sleeperID: playerID,
        //             espnID: espnInfo.id != 'NA' ? espnInfo.id : playersInfo.players[playerID].espnID,
        //             fn: playersInfo.players[playerID].fn,
        //             ln: playersInfo.players[playerID].ln,
        //             pos: playersInfo.players[playerID]?.pos || null,
        //             ht: espnInfo.height,
        //             wt: espnInfo.weight,
        //             col: espnInfo.college,
        //             bd: espnInfo.birthDate,
        //             ry: espnInfo.rookieYear,
        //             t: [],
        //         }

        //         for(const year in espnInfo.t) {

        //             if(playersInfo.players[playerID].wi[year]) {
        //                 for(const week in playersInfo.players[playerID].wi[year]) {
        //                     if(week < 19) {

        //                         let team;
        //                         if(espnInfo.t[year].length > 1) {
        //                             if(espnInfo.t[year][0].firstWeek <= week && espnInfo.t[year][0].lastWeek >= week) {
        //                                 team = espnInfo.t[year][0].team;
        //                             } else {
        //                                 team = espnInfo.t[year][1].team;
        //                             }
        //                         } else if(nflTeams.find(t => t.sleeperID == playersInfo.players[playerID].wi[year][week].t)) {
        //                             team = nflTeams.find(t => t.sleeperID == playersInfo.players[playerID].wi[year][week].t).espnAbbreviation;
        //                         } else {
        //                             team = espnInfo.t[year][0];
        //                         }

        //                         if(espnPlayersInfo[playerID].t.length == 0 || !espnPlayersInfo[playerID].t.find(e => e.t == team)) {

        //                             espnPlayersInfo[playerID].t.push({
        //                                 t: team,
        //                                 s: {
        //                                     y: year,
        //                                     w: week,
        //                                 },
        //                                 f: {
        //                                     y: null,
        //                                     w: null,
        //                                 },
        //                                 j: espnInfo.jerseys[year].length == 1 ? espnInfo.jerseys[year][0] : week >= espnInfo.jerseys[year][0].firstWeek && espnInfo.jerseys[year][0].lastWeek >= week ? espnInfo.jerseys[year][0].number : espnInfo.jerseys[year][1].number,
        //                             })
         
        //                         } else if(espnPlayersInfo[playerID].t.find(e => e.t == team).f.y == null) {
        //                             espnPlayersInfo[playerID].t.find(e => e.t == team).f.y = year;
        //                             espnPlayersInfo[playerID].t.find(e => e.t == team).f.w = week;
        //                         } else  {
        //                             if(espnPlayersInfo[playerID].t.find(e => e.t == team && e.s.y <= year && e.s.w <= week && e.f.y >= year && e.f.w >= week)) {
        //                                 continue;
        //                             } else if(espnPlayersInfo[playerID].t.find(e => e.t == team && e.s.y <= year && e.s.w <= week)) {
        //                                 espnPlayersInfo[playerID].t.find(e => e.t == team && e.s.y <= year && e.s.w <= week).f.y = year;
        //                                 espnPlayersInfo[playerID].t.find(e => e.t == team && e.s.y <= year && e.s.w <= week).f.w = week;
        //                             } else {
        //                                 espnPlayersInfo[playerID].t.find(e => e.t == team && e.f.y >= year && e.f.w >= week).s.y = year;
        //                                 espnPlayersInfo[playerID].t.find(e => e.t == team && e.f.y >= year && e.f.w >= week).s.w = week;
        //                             }

        //                         }
        //                     }
        //                 }
        //             } else {
        //                 for(let i = 1; i < 19; i++) {
        //                     let team;
        //                     if(espnInfo.t[year].length > 1) {
        //                         if(espnInfo.t[year][0].firstWeek <= i && espnInfo.t[year][0].lastWeek >= i) {
        //                             team = espnInfo.t[year][0].team;
        //                         } else {
        //                             team = espnInfo.t[year][1].team;
        //                         }
        //                     } else {
        //                         team = espnInfo.t[year][0];
        //                     }

        //                     if(espnPlayersInfo[playerID].t.length == 0 || !espnPlayersInfo[playerID].t.find(e => e.t == team)) {

        //                         espnPlayersInfo[playerID].t.push({
        //                             t: team,
        //                             s: {
        //                                 y: year,
        //                                 w: i,
        //                             },
        //                             f: {
        //                                 y: null,
        //                                 w: null,
        //                             },
        //                             j: espnInfo.jerseys[year].length == 1 ? espnInfo.jerseys[year][0] : i >= espnInfo.jerseys[year][0].firstWeek && espnInfo.jerseys[year][0].lastWeek >= i ? espnInfo.jerseys[year][0].number : espnInfo.jerseys[year][1].number,
        //                         })

        //                     } else if(espnPlayersInfo[playerID].t.find(e => e.t == team).f.y == null) {
        //                     espnPlayersInfo[playerID].t.find(e => e.t == team).f.y = year;
        //                     espnPlayersInfo[playerID].t.find(e => e.t == team).f.w = i;
        //                     } else  {
        //                         if(espnPlayersInfo[playerID].t.find(e => e.t == team && e.s.y <= year && e.s.w <= i && e.f.y >= year && e.f.w >= i)) {
        //                             continue;
        //                         } else if(espnPlayersInfo[playerID].t.find(e => e.t == team && e.s.y <= year && e.s.w <= i)) {
        //                             espnPlayersInfo[playerID].t.find(e => e.t == team && e.s.y <= year && e.s.w <= i).f.y = year;
        //                             espnPlayersInfo[playerID].t.find(e => e.t == team && e.s.y <= year && e.s.w <= i).f.w = i;
        //                         } else {
        //                             espnPlayersInfo[playerID].t.find(e => e.t == team && e.f.y >= year && e.f.w >= i).s.y = year;
        //                             espnPlayersInfo[playerID].t.find(e => e.t == team && e.f.y >= year && e.f.w >= i).s.w = i;
        //                         }
        //                     }

                            



        //                 }
        //             }

        //         }
        //     } else if(playersInfo.players[playerID].pos == 'DEF') {
        //         const team = nflTeams.find(t => t.sleeperID == playerID);
        //         espnPlayersInfo[playerID] = {
        //             id: masterID,
        //             sleeperID: playerID,
        //             espnID: team.espnID,
        //             abv: team.espnAbbreviation,
        //             fn: team.fn,
        //             ln: team.ln,
        //             pos: 'DEF',
        //             col: team.color,
        //             alt: team.alternateColor,
        //         }
        //         // for(const year in playersInfo.players[playerID].wi) {
        //         //     espnPlayersInfo[playerID].years[year] = {};
        //         //     for(const week in playersInfo.players[playerID].wi[year]) {
        //         //         if(week < 19) {
        //         //             espnPlayersInfo[playerID].years[year][week] = {
        //         //                 p: playersInfo.players[playerID].wi[year][week].p,
        //         //                 o: playersInfo.players[playerID].wi[year][week].o,
        //         //             }
        //         //         }
        //         //     }
        //         // }
        //     } else {
        //         espnPlayersInfo[playerID] = {
        //             id: masterID,
        //             sleeperID: playerID,
        //             espnID: playersInfo.players[playerID].espnID,
        //             fn: playersInfo.players[playerID].fn,
        //             ln: playersInfo.players[playerID].ln,
        //             pos: playersInfo.players[playerID]?.pos || null,
        //         }
        //     }
        //     masterID++;
            
        // }
        // // let rookies = allNflPlayerInfo.filter(p => p.espn.rookieYear == 2021 && p.espn.id == 'NA');

        // // const scoreboardPromises = [];
        // // scoreboardPromises.push(fetch(`https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/2021/draft/rounds?lang=en&region=us`, {compress: true}));

        // // const scoreboardsRes = await waitForAll(...scoreboardPromises).catch((err) => { console.error(err); });

        // // const scoreboardJsonPromises = [];
        // // for(const scoreboardRes of scoreboardsRes) {
        // //     const data = scoreboardRes.json();
        // //     scoreboardJsonPromises.push(data)
        // //     if (!scoreboardRes.ok) {
        // //         throw new Error(data);
        // //     }
        // // }
        // // const scoreboardsData = await waitForAll(...scoreboardJsonPromises).catch((err) => { console.error(err); });

        // // for(let r = 0; r < 7; r++) {
        // //     const picks = scoreboardsData[0].items[r].picks;
        // //     for(let p = 0; p < picks.length; p++) {
        // //         const espnPlayerID = picks[p].athlete.$ref.slice(91, picks[p].athlete.$ref.indexOf('?'));

        // //         const gamesPromises = [];
        // //         gamesPromises.push(fetch(`${picks[p].athlete.$ref}`));
                

        // //         const gamesRes = await waitForAll(...gamesPromises).catch((err) => { console.error(err); });
        // //         const gameJsonPromises = [];
        // //         for(const gameRes of gamesRes) {
        // //             const data = gameRes.json();
        // //             gameJsonPromises.push(data)
        // //             if (!gameRes.ok) {
        // //                 throw new Error(data);
        // //             }
        // //         }
        // //         const gamesData = await waitForAll(...gameJsonPromises).catch((err) => { console.error(err); });

        // //         const matcher = {
        // //             fn: gamesData[0].firstName,
        // //             ln: gamesData[0].lastName,
        // //             pos: gamesData[0].position.abbreviation,
        // //         }
        // //         if(matcher.pos == 'PK') {
        // //             matcher.pos = 'K';
        // //         } else if(matcher.pos == 'FB') {
        // //             matcher.pos = 'RB';
        // //         }
        // //         const rookie = rookies.find(o => o.sleeper.fn == matcher.fn && o.sleeper.ln == matcher.ln && o.sleeper.pos == matcher.pos);
        // //         if(rookie) {
        // //             espnPlayersInfo[rookie.sleeper.id] = espnPlayerID;
        // //         }
        // //     }
        // // }

    //     return espnPlayersInfo;

    // }

    // let espnPlayersInfo;

    // const survivor = (data) => {
    //     const survivorData = {};
    //     survivorData[data.countries[0].country] = [];

    //     for(const season of data.countries[0].seasons) {

    //         const entry = {
    //             season: season.season,
    //             title: season.title,
    //             episodeInfo: {
    //                 numEpisodes: season.numEpisodes,
    //                 episodes: [],
    //             },
    //             castInfo: {
    //                 numCast: season.numCast,
    //                 cast: [],
    //             },
    //             days: season.numDays,
    //             winner: season.winner,
    //             finalistInfo: {
    //                 finalists: [],
    //             },
    //             juryInfo: {
    //                 jury: [],
    //             },
    //             wikiLink: season.wikiLink,
    //             viewers: season.viewers,
    //             airDates: {
    //                 start: season.airStart,
    //                 end: season.airEnd,
    //             },
    //             filmDates: {
    //                 start: season.filmStart,
    //                 end: season.filmEnd,
    //             },
    //             location: season.location,
    //         }
    //         if(season.season == 42) continue;
    //         entry.finalistInfo.finalists.push(season.winner);
    //         if(!season.finalists.includes('\n')) {
    //             entry.finalistInfo.finalists.push(season.finalists);
    //         } else {
    //             let finalist = season.finalists.split('\n')[0];
    //             let finalist2 = season.finalists.split('\n')[1];
    //             entry.finalistInfo.finalists.push(finalist);
    //             entry.finalistInfo.finalists.push(finalist2);
    //         }
    //         entry.finalistInfo.numFinalists = entry.finalistInfo.finalists.length;

    //         for(const cast of season.cast) {
    //             const castEntry = {
    //                 name: cast.split('"')[1],
    //                 immunityInfo: {
    //                     team: 0,
    //                     individual: 0,
    //                 },
    //                 tribeInfo: {
    //                     original: null,
    //                     tribes: [],
    //                 },
    //             }
    //             entry.castInfo.cast.push(castEntry);
    //         }
    //         for(let e = 0; e < season.episodeTitles.length; e++) {
    //             if(!season.episodeTitles[e].includes('►') && season.episodeAirDates[e]) {
    //                 entry.episodeInfo.episodes.push({
    //                     title: season.episodeTitles[e].split('"')[1],
    //                     airDate: season.episodeAirDates[e].split('"')[1],
    //                 });
    //             }
    //         }
            
    //         survivorData[data.countries[0].country].push(entry);
    //     }
    //     return survivorData;
    // }

    const film = (data) => {
        const filmAlmanac = {
            films: {},
            genres: {
                1000: 'War Film',
                1001: 'World War One Film',
                1002: 'World War Two Film',
                1003: 'US-Vietnam War Film',
                1004: 'US-Middle East War Film ',
                1005: 'US Civil War Film',
                1006: 'American Revolution Film',
                1007: 'Combat Film',
                1030: 'Period Piece',
                1031: 'Ancient Egypt Film',
                1032: 'Ancient Greece Film',
                1033: 'Ancient Rome Film',
                1034: 'Medieval Film',
                1035: 'Prehistoric Film',
                1036: 'Roaring Twenties Film',
                1037: 'Swinging Sixties Film',
                1038: 'Victorianish Film',
                1080: 'Character Study',
                1090: 'Religious Film',
                1091: 'Evangelical Film',
                1092: 'Buddhist Film',
                1093: 'Chistian Film',
                1094: 'Hindu Film',
                1095: 'Islamic Film',
                1096: 'Jewish Film',
                2000: 'Action',
                2001: 'Disaster Film',
                2002: 'Sword & Sandal Film',
                2010: 'Flying Film',
                2011: 'Revenge Film',
                2020: 'Fighting Film',
                2021: 'Boxing Film',
                2022: 'Kung-Fu',
                2023: 'Samurai Film',
                2040: 'Superhero Film',
                2041: 'Origin Story',
                2060: 'Crime Film',
                2061: 'Buddy-Cop Film',
                2062: 'Courtroom Drama',
                2063: 'Detective Film',
                2064: 'Gangster Film',
                2065: 'Gang-Life Film',
                2066: 'Hostage Film',
                2067: 'Kidnapping Film',
                2068: 'Narco-Film',
                2069: 'Prison Film',
                2070: 'Undercover Film',
                2090: 'Cult Film',
                3000: 'Drama',
                3001: 'Family Drama',
                3002: 'Tragedy',
                3003: 'Social Issue Film',
                3004: 'Ensemble Film',
                3005: 'Mentor Film',
                3006: 'Hyperlink Film',
                3007: 'Teen Film',
                3008: 'Workplace Film',
                3009: 'Big Finance Film',
                3010: 'Sport Film',
                3011: 'Baseball Film',
                3012: 'Basketball Film',
                3013: 'Bowling Film',
                3014: 'Chess Film',
                3015: 'Cycling Film',
                3016: 'Football Film',
                3017: 'Golf Film',
                3018: 'Gymnastics Film',
                3019: 'Hockey Film',
                3020: 'Ice Skating Film',
                3021: 'Autoracing Film',
                3022: 'Rugby Film',
                3023: 'Skating Film',
                3024: 'Soccer Film',
                3025: 'Surfing Film',
                3026: 'Winter Sports Film',
                3030: 'Gambling Film',
                3040: 'Coming-of-Age Film',
                3041: 'Middle Age Film',
                3042: 'Arrested Development Film',
                3050: 'Family-Oriented Film',
                3051: 'Animal Film',
                3052: 'Urban Drama',
                3053: 'Suburban Drama',
                3060: 'Medical Film',
                3061: 'Dying Film',
                3062: 'Addiction Film',
                3063: 'Mental Illness Film',
                3064: 'Disability Film',
                3065: 'Going Native Film',
                3066: 'Political Film',
                3067: 'Class Issue Film',
                3068: 'Racial Film',
                3070: 'Animation',
                3071: 'Stop-Motion Animation',
                3072: 'Anime',
                3073: 'Hand-drawn Animation',
                3080: 'Theater Film',
                3081: 'Writing Film',
                3082: 'Dance Film',
                3083: 'Film-making Film',
                3084: 'Art Film',
                3085: 'Cooking Film',
                3086: 'Fashion Film',
                3087: 'Music Film',
                3090: 'Musical',
                4000: 'Romance',
                4001: 'Breakup Film',
                4002: 'Love Triangle Film',
                4003: 'LGBT Film',
                4004: 'Feminist Film',
                4004: 'Erotic Film',
                4005: 'Wedding Film',
                4006: 'Rocky Relationship Film',
                4007: 'Singles Film',
                4020: 'Historical Film',
                4021: 'Alternative History Film',
                4022: 'Autobiographical Film',
                4023: 'Based on a True Story',
                4024: 'Docudrama',
                4025: 'Documentary',
                4026: 'Historical Event Film',
                4030: 'Nazi-Centric Film',
                4040: 'Holiday Film',
                4041: 'Christmas Film',
                4042: 'Halloween Film',
                4043: 'Thanksgiving Film',
                4044: 'Valentines Day Film',
                4050: 'Anthology',
                4060: 'Avant-garde Film',
                4070: 'Mumblecore',
                4071: 'Slice-of-Life Film',
                4080: 'Fish-out-of-Water Film',
                5000: 'Comedy',
                5001: 'Slapstick Comedy',
                5002: 'Raunchy Comedy',
                5003: 'Dark Comedy',
                5004: 'Cringe Comedy',
                5005: 'Farce',
                5006: 'Satire',
                5007: 'Comedy of Errors',
                5008: 'Gross-Out Comedy',
                5009: 'Screwball Comedy',
                5010: 'Double Act Comedy',
                5011: 'Stoner Comedy',
                5020: 'Switcheroo Film',
                5050: 'Parody',
                5070: 'Prank Comedy',
                5080: 'Party Film',
                6000: 'Adventure',
                6001: 'Treasure Hunt',
                6002: 'Swashbuckler',
                6003: 'Sea Adventure',
                6004: 'Climbing Film',
                6005: 'Misadventure Film',
                6006: 'Roadtrip Film',
                6010: 'Journalistic Film',
                6020: 'Cat-and-Mouse Film',
                6030: 'Fantasy',
                6031: 'Fairytales & Legends',
                6040: 'Western',
                6050: 'Survival Film',
                6051: 'Cold-Survival Film',
                6052: 'Desert-Survival Film',
                6053: 'Forest-Survival Film',
                6054: 'Island-Survival Film',
                6055: 'Jungle-Survival Film',
                6056: 'Ocean-Survival Film',
                6057: 'Savannah-Survival Film',
                6070: 'Apocalyptic Film',
                6071: 'Post-Apocalyptic Film',
                7000: 'Mystery',
                7001: 'Missing Person Film',
                7002: 'Espionage Film',
                7003: 'Whodunit',
                7010: 'Bodysnatcher Film',
                7030: 'Noir',
                7051: 'Thriller',
                7052: 'Psychological Film',
                7053: 'Stalker Film',
                7054: 'Claustrophobic Film',
                7055: 'Railway Film',
                7056: 'Escape Film',
                7057: 'Instrutioneer Film',
                7058: 'Military Film',
                7080: 'Outerspace Film',
                7081: 'Subaquatic Film',
                7082: 'Submarine Film',
                7083: 'Subterranean Film',
                7090: 'Asylum Film',
                8000: 'Science Fiction',
                8001: 'Artifical Intelligence Film',
                8002: 'Techno-Film',
                8003: 'Cyber-Film',
                8004: 'Social Media Film',
                8020: 'Afterlife Film',
                8030: 'Cyberpunk',
                8031: 'Steampunk',
                8040: 'Future Film',
                8041: 'Retrofuturistic Film',
                8050: 'Time Travel Film',
                8051: 'Time Loop Film',
                8052: 'Time Dilation Film',
                8053: 'Nonlinear Narrative',
                8060: 'Dystopian Film',
                8065: 'Ecological Film',
                8070: 'Tokusatsu',
                8071: 'Kaiju',
                8072: 'Kaijin',
                8090: 'Illusionist Film',
                9000: 'Horror',
                9001: 'Slasher',
                9002: 'Body Horror',
                9003: 'Gore',
                9004: 'Home Invasion Film',
                9005: 'Giallo',
                9006: 'Possession Film',
                9010: 'Folk Horror',
                9011: 'Camp & Cabin Horror',
                9020: 'Found Footage Film',
                9021: 'Screenshare Film',
                9050: 'Monster Film',
                9051: 'Mummy Film',
                9052: 'Zombie Film',
                9053: 'Dinosaur Film',
                9054: 'Megafauna Film',
                9055: 'Alien Film',
                9056: 'Ghost Film',
                9057: 'Demon Film',
                9058: 'Vampire Film',
                9059: 'Angel Film',
                9060: 'Lovecraftian Film',
                9061: 'Dragon Film',
                9062: 'Werewolf Film',
                9063: 'Witchcraft Film',
                9064: 'Occult Film',
            },
        };
        const films = data.flimData;
        for(const film of films) {
            const rtmJson = JSON.parse(filmJson.flimData[films.indexOf(film)].ratingInfo.rottenTomatoes.json);

            if(film.crewInfo.categories.length != film.crewInfo.categoriesArray.length) {
                let categories = [];
                for(const cat of film.crewInfo.categories) {
                    if(cat) categories.push(cat);
                }
                film.crewInfo.categories = categories;
            }

            filmAlmanac.films[film.masterID] = {
                masterID: film.masterID,
                type: {
                    medium: film.type,
                    isSequel: film.isSequel,
                    isPrequel: film.isPrequel,
                    isFranchise: film.isFranchise,
                },
                title: {
                    OG: filmJson.flimData[films.indexOf(film)].foreignTitle ? filmJson.flimData[films.indexOf(film)].foreignTitle : filmJson.flimData[films.indexOf(film)].engTitle,
                    ENG: filmJson.flimData[films.indexOf(film)].engTitle,
                    ALT: [],
                },
                year: film.year,
                release: {
                    date: film.releaseDate,
                    event: film.releaseInfo,
                },
                filming: {
                    locations: film.filmingInfo.locations,
                },
                personal: {
                    rating: film.ratingInfo.personal,
                    firstWatch: film.firstWatch,
                },
                ratings: {
                    flickChart: {
                        globalRank: film.ratingInfo.flickChart.globalRank,
                        globalNum1: film.ratingInfo.flickChart.ones_20s[0],
                        globalTop20:  film.ratingInfo.flickChart.ones_20s[1],
                        usersRanked: film.ratingInfo.flickChart.numUsers_numTimes[0],
                        timesRanked:  film.ratingInfo.flickChart.numUsers_numTimes[1],
                        winPerc: film.ratingInfo.flickChart.winPerc,
                        myRank: film.ratingInfo.flickChart.info[0],
                        myRating:  film.ratingInfo.flickChart.info[1],
                        myTimesRanked:  film.ratingInfo.flickChart.info[2],
                        myTotalRanked:  film.ratingInfo.flickChart.info[3],
                        myTotalRankings:  film.ratingInfo.flickChart.info[4],
                        upd: film.ratingInfo.lastUpdate,
                    },
                    imdb: {
                        r: film.ratingInfo.imdb.rating_size[0] * 10,
                        n: film.ratingInfo.imdb.rating_size[1],
                        upd: film.ratingInfo.lastUpdate,
                        d: {
                            age: {
                                18_29: {
                                    r: film.ratingInfo.imdb.distribution.ages['18_29'][0],
                                    n: film.ratingInfo.imdb.distribution.ages['18_29'][1],
                                },
                                30_44: {
                                    r: film.ratingInfo.imdb.distribution.ages['30_44'][0],
                                    n: film.ratingInfo.imdb.distribution.ages['30_44'][1],
                                },
                                over45: {
                                    r: film.ratingInfo.imdb.distribution.ages.over45[0],
                                    n: film.ratingInfo.imdb.distribution.ages.over45[1],
                                },
                                under18: {
                                    r: film.ratingInfo.imdb.distribution.ages.under18[0],
                                    n: film.ratingInfo.imdb.distribution.ages.under18[1],
                                }
                            },
                            sex: {
                                m: {
                                    allAges: {
                                        r: film.ratingInfo.imdb.distribution.men.allAges[0],
                                        n: film.ratingInfo.imdb.distribution.men.allAges[1],
                                    },
                                    18_29: {
                                        r: film.ratingInfo.imdb.distribution.men['18_29'][0],
                                        n: film.ratingInfo.imdb.distribution.men['18_29'][1],
                                    },
                                    30_44: {
                                        r: film.ratingInfo.imdb.distribution.men['30_44'][0],
                                        n: film.ratingInfo.imdb.distribution.men['30_44'][1],
                                    },
                                    over45: {
                                        r: film.ratingInfo.imdb.distribution.men.over45[0],
                                        n: film.ratingInfo.imdb.distribution.men.over45[1],
                                    },
                                    under18: {
                                        r: film.ratingInfo.imdb.distribution.men.under18[0],
                                        n: film.ratingInfo.imdb.distribution.men.under18[1],
                                    },
                                },
                                f: {
                                    allAges: {
                                        r: film.ratingInfo.imdb.distribution.women.allAges[0],
                                        n: film.ratingInfo.imdb.distribution.women.allAges[1],
                                    },
                                    18_29: {
                                        r: film.ratingInfo.imdb.distribution.women['18_29'][0],
                                        n: film.ratingInfo.imdb.distribution.women['18_29'][1],
                                    },
                                    30_44: {
                                        r: film.ratingInfo.imdb.distribution.women['30_44'][0],
                                        n: film.ratingInfo.imdb.distribution.women['30_44'][1],
                                    },
                                    over45: {
                                        r: film.ratingInfo.imdb.distribution.women.over45[0],
                                        n: film.ratingInfo.imdb.distribution.women.over45[1],
                                    },
                                    under18: {
                                        r: film.ratingInfo.imdb.distribution.women.under18[0],
                                        n: film.ratingInfo.imdb.distribution.women.under18[1],
                                    },
                                }
                            },
                            score: {
                                1: film.ratingInfo.imdb.distribution.rating1_10[0],
                                2: film.ratingInfo.imdb.distribution.rating1_10[1],
                                3: film.ratingInfo.imdb.distribution.rating1_10[2],
                                4: film.ratingInfo.imdb.distribution.rating1_10[3],
                                5: film.ratingInfo.imdb.distribution.rating1_10[4],
                                6: film.ratingInfo.imdb.distribution.rating1_10[5],
                                7: film.ratingInfo.imdb.distribution.rating1_10[6],
                                8: film.ratingInfo.imdb.distribution.rating1_10[7],
                                9: film.ratingInfo.imdb.distribution.rating1_10[8],
                                10: film.ratingInfo.imdb.distribution.rating1_10[9],
                            }
                        }
                    },
                    tmdb: {
                        r: film.ratingInfo.tmdb.rating_size[0],
                        n: film.ratingInfo.tmdb.rating_size[1],
                        upd: film.ratingInfo.lastUpdate,
                    },
                    metaCritic: {
                        critics: {
                            r: film.ratingInfo.metaCritic.criticsInfo[0],
                            n: film.ratingInfo.metaCritic.criticsInfo[1],
                            pos: film.ratingInfo.metaCritic.criticsInfo[2],
                            mix: film.ratingInfo.metaCritic.criticsInfo[3],
                            neg: film.ratingInfo.metaCritic.criticsInfo[4],
                        },
                        users: {
                            r: film.ratingInfo.metaCritic.usersInfo[0],
                            n: film.ratingInfo.metaCritic.usersInfo[1],
                            pos: film.ratingInfo.metaCritic.usersInfo[2],
                            mix: film.ratingInfo.metaCritic.usersInfo[3],
                            neg: film.ratingInfo.metaCritic.usersInfo[4],
                        },
                        upd: film.ratingInfo.lastUpdate,
                    },
                    trakt: {
                        r: film.ratingInfo.trakt.rating_size[0],
                        n: film.ratingInfo.trakt.rating_size[1],
                        watch: film.ratingInfo.trakt.watched,
                        collect: film.ratingInfo.trakt.ccollected,
                        play: film.ratingInfo.trakt.plays,
                        upd: film.ratingInfo.lastUpdate,
                    },
                    rotTom: {
                        critics: {
                            all: {
                                r: film.ratingInfo.rottenTomatoes.allCriticsInfo[4] * 10,
                                n: film.ratingInfo.rottenTomatoes.allCriticsInfo[5],
                                pos: film.ratingInfo.rottenTomatoes.allCriticsInfo[2],
                                neg: film.ratingInfo.rottenTomatoes.allCriticsInfo[3],
                                tomatoScore: film.ratingInfo.rottenTomatoes.allCriticsInfo[1],
                                tomatoState: film.ratingInfo.rottenTomatoes.allCriticsInfo[0],
                            },
                            top: {
                                r: film.ratingInfo.rottenTomatoes.topCriticsInfo[4] * 10,
                                n: film.ratingInfo.rottenTomatoes.topCriticsInfo[5],
                                pos: film.ratingInfo.rottenTomatoes.topCriticsInfo[2],
                                neg: film.ratingInfo.rottenTomatoes.topCriticsInfo[3],
                                tomatoScore: film.ratingInfo.rottenTomatoes.topCriticsInfo[1],
                                tomatoState: film.ratingInfo.rottenTomatoes.topCriticsInfo[0],
                            },
                        },
                        users: {
                            all: {
                                r: film.ratingInfo.rottenTomatoes.allUsersInfo[4] * 20,
                                n: film.ratingInfo.rottenTomatoes.allUsersInfo[5],
                                pos: film.ratingInfo.rottenTomatoes.allUsersInfo[2],
                                neg: film.ratingInfo.rottenTomatoes.allUsersInfo[3],
                                tomatoScore: film.ratingInfo.rottenTomatoes.allUsersInfo[1],
                                tomatoState: film.ratingInfo.rottenTomatoes.allUsersInfo[0],
                                reviews: rtmJson?.modal.audienceScoreAll.reviewCount || null, 
                            },
                            verified: {
                                r: rtmJson?.modal.audienceScoreVerified.averageRating ? rtmJson.modal.audienceScoreVerified.averageRating * 20 : null,
                                n: rtmJson?.modal.audienceScoreVerified.ratingCount || null,
                                pos: rtmJson?.modal.audienceScoreVerified.likedCount || null,
                                neg: rtmJson?.modal.audienceScoreVerified.notLikedCount || null,
                                tomatoScore: rtmJson?.modal.audienceScoreVerified.score ? rtmJson.modal.audienceScoreVerified.score : null,
                                tomatoState: rtmJson?.modal.audienceScoreVerified.audienceClass || null,
                                reviews: rtmJson?.modal.audienceScoreVerified.reviewCount || null, 
                            },
                        },
                        upd: film.ratingInfo.lastUpdate,
                    },
                    lbxd: {
                        r: film.ratingInfo.letterboxd.rating * 20,
                        n: film.ratingInfo.letterboxd.n,
                        watch: film.ratingInfo.letterboxd.watched, 
                        upd: film.ratingInfo.lastUpdate,
                    },
                },
                siteInfo: {
                    ids: film.siteIDs,
                    links: film.links,
                },
                tagline: film.tagline ? film.tagline : film.taglineFC,
                synopsis: film.synopsis,
                setting: {
                    time: null,
                    era: null,
                    country: null,
                    region: null,
                    state: null,
                    city: null,
                    limited: [],
                },
                specs: film.specs,
                genre: {},
                language: {
                    pri: null,
                    sec: null,
                    all: film.lanaguageInfo.allSpoken,
                },
                source: {
                    type: film.sourceInfo.type,
                    authors: film.sourceInfo.authors,
                    title: film.sourceInfo.title,
                    releaseDate: film.sourceInfo.releaseDate,
                },
                box: {
                    budget: film.boxOffice.budget,
                    grossUS: film.boxOffice.grossUS,
                    grossWorld: film.boxOffice.grossWorld,
                },
                countries: film.countries,
                censor: film.censorRating,
                cast: [],
                crew: {},
                company: {},
            }

            if(filmAlmanac.films[film.masterID].type.medium == 'limited series') {
                filmAlmanac.films[film.masterID].type.seriesInfo = {
                    numEpisodes: film.episodeInfo[0],
                }
            }

            if(film.altTitles) {
                if(Array.isArray(film.altTitles)) {
                    for(const alt of film.altTitles) {
                        filmAlmanac.films[film.masterID].title.ALT.push(alt);
                    }
                } else {
                    filmAlmanac.films[film.masterID].title.ALT.push(film.altTitles);
                }
            }

            if(filmAlmanac.films[film.masterID].language.all && !Array.isArray(filmAlmanac.films[film.masterID].language.all)) {
                filmAlmanac.films[film.masterID].language.pri = filmAlmanac.films[film.masterID].language.all;
            } else {
                filmAlmanac.films[film.masterID].language.pri = filmAlmanac.films[film.masterID].language.all[0];
            }

            if(filmAlmanac.films[film.masterID].tagline && filmAlmanac.films[film.masterID].tagline.includes('"')) {
                filmAlmanac.films[film.masterID].tagline = filmAlmanac.films[film.masterID].tagline.slice(1);
                filmAlmanac.films[film.masterID].tagline = filmAlmanac.films[film.masterID].tagline.slice(0, filmAlmanac.films[film.masterID].tagline.indexOf('"'));
            }
            if(filmAlmanac.films[film.masterID].synopsis && filmAlmanac.films[film.masterID].synopsis.includes('"')) {
                filmAlmanac.films[film.masterID].synopsis = filmAlmanac.films[film.masterID].synopsis.slice(1);
                filmAlmanac.films[film.masterID].synopsis = filmAlmanac.films[film.masterID].synopsis.slice(0, filmAlmanac.films[film.masterID].synopsis.indexOf('"'));
            }

            filmAlmanac.films[film.masterID].ratings.master = {
                r: ((filmAlmanac.films[film.masterID].ratings.imdb.r * filmAlmanac.films[film.masterID].ratings.imdb.n) + (filmAlmanac.films[film.masterID].ratings.tmdb.r * filmAlmanac.films[film.masterID].ratings.tmdb.n) + (filmAlmanac.films[film.masterID].ratings.trakt.r * filmAlmanac.films[film.masterID].ratings.trakt.n) + (filmAlmanac.films[film.masterID].ratings.rotTom.critics.all.r * filmAlmanac.films[film.masterID].ratings.rotTom.critics.all.n) + (filmAlmanac.films[film.masterID].ratings.rotTom.users.all.r * filmAlmanac.films[film.masterID].ratings.rotTom.users.all.n) + (filmAlmanac.films[film.masterID].ratings.lbxd.r * filmAlmanac.films[film.masterID].ratings.lbxd.n) + (filmAlmanac.films[film.masterID].ratings.metaCritic.critics.r * filmAlmanac.films[film.masterID].ratings.metaCritic.critics.n) + (filmAlmanac.films[film.masterID].ratings.metaCritic.users.r * filmAlmanac.films[film.masterID].ratings.metaCritic.users.n)) / (filmAlmanac.films[film.masterID].ratings.lbxd.n + filmAlmanac.films[film.masterID].ratings.imdb.n + filmAlmanac.films[film.masterID].ratings.tmdb.n + filmAlmanac.films[film.masterID].ratings.trakt.n + filmAlmanac.films[film.masterID].ratings.rotTom.critics.all.n + filmAlmanac.films[film.masterID].ratings.rotTom.users.all.n + filmAlmanac.films[film.masterID].ratings.metaCritic.critics.n + filmAlmanac.films[film.masterID].ratings.metaCritic.users.n),
                n: filmAlmanac.films[film.masterID].ratings.lbxd.n + filmAlmanac.films[film.masterID].ratings.imdb.n + filmAlmanac.films[film.masterID].ratings.tmdb.n + filmAlmanac.films[film.masterID].ratings.trakt.n + filmAlmanac.films[film.masterID].ratings.rotTom.critics.all.n + filmAlmanac.films[film.masterID].ratings.rotTom.users.all.n + filmAlmanac.films[film.masterID].ratings.metaCritic.critics.n + filmAlmanac.films[film.masterID].ratings.metaCritic.users.n
            }

            const crewCatcher = (cat, member, array) => {

                if(!member) {
                    if(!filmAlmanac.films[film.masterID].crew[cat]) filmAlmanac.films[film.masterID].crew[cat] = [];
                    return;
                }

                let cleanMember = member.slice(member.indexOf('(') + 1, member.indexOf(')'));
                let cleanCredit = member.slice(member.indexOf(')') + 3);
                cleanCredit = cleanCredit.slice(0, cleanCredit.indexOf(')'));

                if(cat == 'Writer') {
                    if(member.includes('graphic novel')) {
                        if(!filmAlmanac.films[film.masterID].source.type) filmAlmanac.films[film.masterID].source.type = 'Graphic Novel';
                        if(!filmAlmanac.films[film.masterID].source.authors) filmAlmanac.films[film.masterID].source.authors = [];
                        filmAlmanac.films[film.masterID].source.authors.push(cleanMember);
                    } else if(member.includes('novel')) {
                        if(!filmAlmanac.films[film.masterID].source.type) filmAlmanac.films[film.masterID].source.type = 'Novel';
                        if(!filmAlmanac.films[film.masterID].source.authors) filmAlmanac.films[film.masterID].source.authors = [];
                        filmAlmanac.films[film.masterID].source.authors.push(cleanMember);
                    } else if(member.includes('short story')) {
                        if(!filmAlmanac.films[film.masterID].source.type) filmAlmanac.films[film.masterID].source.type = 'Short Story';
                        if(!filmAlmanac.films[film.masterID].source.authors) filmAlmanac.films[film.masterID].source.authors = [];
                        filmAlmanac.films[film.masterID].source.authors.push(cleanMember);
                    } else if(member.includes('comics') || member.includes('comic book')) {
                        if(!filmAlmanac.films[film.masterID].source.type) filmAlmanac.films[film.masterID].source.type = 'Comic Book';
                        if(!filmAlmanac.films[film.masterID].source.authors) filmAlmanac.films[film.masterID].source.authors = [];
                        filmAlmanac.films[film.masterID].source.authors.push(cleanMember);
                    }
                    if(member.includes('\\') && !filmAlmanac.films[film.masterID].source.title) {
                        let sourceTitle = member.slice(member.indexOf('\\') + 2);
                        filmAlmanac.films[film.masterID].source.title = sourceTitle.slice(0, sourceTitle.indexOf('\\'));
                    }
                }

                if(!member.includes('assistant') || !member.includes('supervis')) {
                    if(cat.includes('Script')) {
                        if(member.includes('supervis')) {
                            if(!filmAlmanac.films[film.masterID].crew[cat]) {
                                filmAlmanac.films[film.masterID].crew[cat] = {
                                    p: []
                                }
                            }
                            if(!filmAlmanac.films[film.masterID].crew[cat]['Script Supervisors']) filmAlmanac.films[film.masterID].crew[cat]['Script Supervisors'] = [];
                            filmAlmanac.films[film.masterID].crew[cat]['Script Supervisors'].push({
                                n: cleanMember,
                                c: cleanCredit.length > 0 ? cleanCredit : null,
                            })
                            return;
                        } else if(member.includes('doctor')) {
                            if(!filmAlmanac.films[film.masterID].crew[cat]) {
                                filmAlmanac.films[film.masterID].crew[cat] = {
                                    p: []
                                }
                            }
                            if(!filmAlmanac.films[film.masterID].crew[cat]['Script Doctors']) filmAlmanac.films[film.masterID].crew[cat]['Script Doctors'] = [];
                            filmAlmanac.films[film.masterID].crew[cat]['Script Doctors'].push({
                                n: cleanMember,
                                c: cleanCredit.length > 0 ? cleanCredit : null,
                            })
                            return;
                        } 
                    } else if(cat.includes('Location')) {
                        if(!filmAlmanac.films[film.masterID].crew[cat]) {
                            filmAlmanac.films[film.masterID].crew[cat] = {
                                p: []
                            }
                        }
                        if(member.includes('manager')) {
                            if(!filmAlmanac.films[film.masterID].crew[cat]['Managers']) filmAlmanac.films[film.masterID].crew[cat]['Managers'] = [];
                            filmAlmanac.films[film.masterID].crew[cat]['Managers'].push(cleanMember);
                            return;
                        } else  if(member.includes('scout')) {
                            if(!filmAlmanac.films[film.masterID].crew[cat]['Scouts']) filmAlmanac.films[film.masterID].crew[cat]['Scouts'] = [];
                            filmAlmanac.films[film.masterID].crew[cat]['Scouts'].push(cleanMember);
                            return;
                        } else  if(member.includes('coordinator')) {
                            if(!filmAlmanac.films[film.masterID].crew[cat]['Coordinators']) filmAlmanac.films[film.masterID].crew[cat]['Coordinators'] = [];
                            filmAlmanac.films[film.masterID].crew[cat]['Coordinators'].push(cleanMember);
                            return;
                        }
                    } else if(cat.includes('Stunt')) {
                        if(member.includes('stunt coordinator')) {
                            filmAlmanac.films[film.masterID].crew[cat]['Stunt Coordinator'] = cleanMember;
                            return;
                        }
                    } else if(cat == 'Producer') {
                        if(member.includes('executive')) {
                            if(!filmAlmanac.films[film.masterID].crew[cat]['EP']) filmAlmanac.films[film.masterID].crew[cat]['EP'] = [];
                            filmAlmanac.films[film.masterID].crew[cat]['EP'].push(cleanMember);
                            return;
                        } else  if(member.includes('associate')) {
                            if(!filmAlmanac.films[film.masterID].crew[cat]['AP']) filmAlmanac.films[film.masterID].crew[cat]['AP'] = [];
                            filmAlmanac.films[film.masterID].crew[cat]['AP'].push(cleanMember);
                            return;
                        } else  if(member.includes('co-')) {
                            if(!filmAlmanac.films[film.masterID].crew[cat]['CO']) filmAlmanac.films[film.masterID].crew[cat]['CO'] = [];
                            filmAlmanac.films[film.masterID].crew[cat]['CO'].push(cleanMember);
                            return;
                        }
                    } else if(cat.includes('Visual')) {
                        if(member.includes('supervis')) {
                            if(!filmAlmanac.films[film.masterID].crew[cat]) {
                                filmAlmanac.films[film.masterID].crew[cat] = {
                                    p: []
                                }
                            }
                            if(!filmAlmanac.films[film.masterID].crew[cat]['Supervisors']) filmAlmanac.films[film.masterID].crew[cat]['Supervisors'] = [];
                            filmAlmanac.films[film.masterID].crew[cat]['Supervisors'].push({
                                n: cleanMember,
                                c: cleanCredit.length > 0 ? cleanCredit : null,
                            })
                            return;
                        } else if(member.includes('3D')) {
                            if(!filmAlmanac.films[film.masterID].crew[cat]['3D']) filmAlmanac.films[film.masterID].crew[cat]['3D'] = [];
                            filmAlmanac.films[film.masterID].crew[cat]['3D'].push({
                                n: cleanMember,
                                c: cleanCredit.length > 0 ? cleanCredit : null,
                            })
                            return;
                        } else if(member.includes('compositor')) {
                            if(!filmAlmanac.films[film.masterID].crew[cat]['Compositors']) filmAlmanac.films[film.masterID].crew[cat]['Compositors'] = [];
                            filmAlmanac.films[film.masterID].crew[cat]['Compositors'].push({
                                n: cleanMember,
                                c: cleanCredit.length > 0 ? cleanCredit : null,
                            })
                            return;
                        } else if(member.includes('painter')) {
                            if(!filmAlmanac.films[film.masterID].crew[cat]['Painters']) filmAlmanac.films[film.masterID].crew[cat]['Painters'] = [];
                            filmAlmanac.films[film.masterID].crew[cat]['Painters'].push({
                                n: cleanMember,
                                c: cleanCredit.length > 0 ? cleanCredit : null,
                            })
                            return;
                        } else if(member.includes('color') || member.includes('colour')) {
                            if(!filmAlmanac.films[film.masterID].crew[cat]['Colorists']) filmAlmanac.films[film.masterID].crew[cat]['Colorists'] = [];
                            filmAlmanac.films[film.masterID].crew[cat]['Colorists'].push({
                                n: cleanMember,
                                c: cleanCredit.length > 0 ? cleanCredit : null,
                            })
                            return;
                        } 
                    } else if(cat.includes('Camera')) {
                        if(member.includes('gaffer')) {
                            if(!filmAlmanac.films[film.masterID].crew[cat]['Gaffers']) filmAlmanac.films[film.masterID].crew[cat]['Gaffers'] = [];
                            filmAlmanac.films[film.masterID].crew[cat]['Gaffers'].push({
                                n: cleanMember,
                                c: cleanCredit.length > 0 ? cleanCredit : null,
                            })
                            return;
                        } else if(member.includes('grip')) {
                            if(!filmAlmanac.films[film.masterID].crew[cat]['Grips']) filmAlmanac.films[film.masterID].crew[cat]['Grips'] = [];
                            filmAlmanac.films[film.masterID].crew[cat]['Grips'].push({
                                n: cleanMember,
                                c: cleanCredit.length > 0 ? cleanCredit : null,
                            })
                            return;
                        } else if(member.includes('camera operator')) {
                            if(!filmAlmanac.films[film.masterID].crew[cat]['Camera Ops']) filmAlmanac.films[film.masterID].crew[cat]['Camera Ops'] = [];
                            filmAlmanac.films[film.masterID].crew[cat]['Camera Ops'].push({
                                n: cleanMember,
                                c: cleanCredit.length > 0 ? cleanCredit : null,
                            })
                            return;
                        } else if(member.includes('lighting')) {
                            if(!filmAlmanac.films[film.masterID].crew[cat]['Lighting']) filmAlmanac.films[film.masterID].crew[cat]['Lighting'] = [];
                            filmAlmanac.films[film.masterID].crew[cat]['Lighting'].push({
                                n: cleanMember,
                                c: cleanCredit.length > 0 ? cleanCredit : null,
                            })
                            return;
                        } else if(member.includes('electrician')) {
                            if(!filmAlmanac.films[film.masterID].crew[cat]['Electricians']) filmAlmanac.films[film.masterID].crew[cat]['Electricians'] = [];
                            filmAlmanac.films[film.masterID].crew[cat]['Electricians'].push({
                                n: cleanMember,
                                c: cleanCredit.length > 0 ? cleanCredit : null,
                            })
                            return;
                        } 
                    } else if(cat.includes('Casting')) {
                        if(!filmAlmanac.films[film.masterID].crew[cat]) {
                            filmAlmanac.films[film.masterID].crew[cat] = {
                                p: []
                            }
                        }
                        if(member.includes('extras')) {
                            if(!filmAlmanac.films[film.masterID].crew[cat]['Extras']) filmAlmanac.films[film.masterID].crew[cat]['Extras'] = [];
                            filmAlmanac.films[film.masterID].crew[cat]['Extras'].push({
                                n: cleanMember,
                                c: cleanCredit.length > 0 ? cleanCredit : null,
                            })
                            return;
                        } 
                    } else if(cat.includes('Editorial')) {
                        if(member.includes('color') || member.includes('colour')) {
                            if(!filmAlmanac.films[film.masterID].crew[cat]['Colorists']) filmAlmanac.films[film.masterID].crew[cat]['Colorists'] = [];
                            filmAlmanac.films[film.masterID].crew[cat]['Colorists'].push({
                                n: cleanMember,
                                c: cleanCredit.length > 0 ? cleanCredit : null,
                            })
                            return;
                        } 
                    } else if(cat.includes('Animation')) {
                        if(member.includes('lead animator')) {
                            if(!filmAlmanac.films[film.masterID].crew[cat]['Leads']) filmAlmanac.films[film.masterID].crew[cat]['Leads'] = [];
                            filmAlmanac.films[film.masterID].crew[cat]['Leads'].push({
                                n: cleanMember,
                                c: cleanCredit.length > 0 ? cleanCredit : null,
                            })
                            return;
                        } 
                    } else if(cat.includes('Art')) {
                        if(member.includes('set dresser')) {
                            if(!filmAlmanac.films[film.masterID].crew[cat]['Set Dressers']) filmAlmanac.films[film.masterID].crew[cat]['Set Dressers'] = [];
                            filmAlmanac.films[film.masterID].crew[cat]['Set Dressers'].push({
                                n: cleanMember,
                                c: cleanCredit.length > 0 ? cleanCredit : null,
                            })
                            return;
                        } else if(member.includes('foreman')) {
                            if(!filmAlmanac.films[film.masterID].crew[cat]['Foremen']) filmAlmanac.films[film.masterID].crew[cat]['Foremen'] = [];
                            filmAlmanac.films[film.masterID].crew[cat]['Foremen'].push({
                                n: cleanMember,
                                c: cleanCredit.length > 0 ? cleanCredit : null,
                            })
                            return;
                        } else if(member.includes('set designer')) {
                            if(!filmAlmanac.films[film.masterID].crew[cat]['Set Designers']) filmAlmanac.films[film.masterID].crew[cat]['Set Designers'] = [];
                            filmAlmanac.films[film.masterID].crew[cat]['Set Designers'].push({
                                n: cleanMember,
                                c: cleanCredit.length > 0 ? cleanCredit : null,
                            })
                            return;
                        } else if(member.includes('storyboard')) {
                            if(!filmAlmanac.films[film.masterID].crew[cat]['Storyboard']) filmAlmanac.films[film.masterID].crew[cat]['Storyboard'] = [];
                            filmAlmanac.films[film.masterID].crew[cat]['Storyboard'].push({
                                n: cleanMember,
                                c: cleanCredit.length > 0 ? cleanCredit : null,
                            })
                            return;
                        }
                    } else if(cat == 'Miscellaneous') {
                        if(member.includes('accountant')) {
                            if(!filmAlmanac.films[film.masterID].crew[cat]['Accountants']) filmAlmanac.films[film.masterID].crew[cat]['Accountants'] = [];
                            filmAlmanac.films[film.masterID].crew[cat]['Accountants'].push({
                                n: cleanMember,
                                c: cleanCredit.length > 0 ? cleanCredit : null,
                            })
                            return;
                        } else if(member.includes('stand-in')) {
                            if(!filmAlmanac.films[film.masterID].crew[cat]['StandIns']) filmAlmanac.films[film.masterID].crew[cat]['StandIns'] = [];
                            filmAlmanac.films[film.masterID].crew[cat]['StandIns'].push({
                                n: cleanMember,
                                c: cleanCredit.length > 0 ? cleanCredit : null,
                            })
                            return;
                        } 
                    } else if(cat.includes('Special')) {
                        if(member.includes('supervis')) {
                            if(!filmAlmanac.films[film.masterID].crew[cat]['Supervisors']) filmAlmanac.films[film.masterID].crew[cat]['Supervisors'] = [];
                            filmAlmanac.films[film.masterID].crew[cat]['Supervisors'].push({
                                n: cleanMember,
                                c: cleanCredit.length > 0 ? cleanCredit : null,
                            })
                            return;
                        } 
                    } else if(cat.includes('Sound')) {
                        if(member.includes('supervis')) {
                            if(!filmAlmanac.films[film.masterID].crew[cat]['Supervisors']) filmAlmanac.films[film.masterID].crew[cat]['Supervisors'] = [];
                            filmAlmanac.films[film.masterID].crew[cat]['Supervisors'].push({
                                n: cleanMember,
                                c: cleanCredit.length > 0 ? cleanCredit : null,
                            })
                            return;
                        } else if(member.includes('editor')) {
                            if(!filmAlmanac.films[film.masterID].crew[cat]['Editors']) filmAlmanac.films[film.masterID].crew[cat]['Editors'] = [];
                            filmAlmanac.films[film.masterID].crew[cat]['Editors'].push({
                                n: cleanMember,
                                c: cleanCredit.length > 0 ? cleanCredit : null,
                            })
                            return;
                        } else if(member.includes('foley')) {
                            if(!filmAlmanac.films[film.masterID].crew[cat]['Foley']) filmAlmanac.films[film.masterID].crew[cat]['Foley'] = [];
                            filmAlmanac.films[film.masterID].crew[cat]['Foley'].push({
                                n: cleanMember,
                                c: cleanCredit.length > 0 ? cleanCredit : null,
                            })
                            return;
                        }
                    } else if(cat == 'Music Department') {
                        if(member.includes('supervis')) {
                            if(!filmAlmanac.films[film.masterID].crew[cat]['Supervisors']) filmAlmanac.films[film.masterID].crew[cat]['Supervisors'] = [];
                            filmAlmanac.films[film.masterID].crew[cat]['Supervisors'].push({
                                n: cleanMember,
                                c: cleanCredit.length > 0 ? cleanCredit : null,
                            })
                            return;
                        } else if(member.includes('editor')) {
                            if(!filmAlmanac.films[film.masterID].crew[cat]['Editors']) filmAlmanac.films[film.masterID].crew[cat]['Editors'] = [];
                            filmAlmanac.films[film.masterID].crew[cat]['Editors'].push({
                                n: cleanMember,
                                c: cleanCredit.length > 0 ? cleanCredit : null,
                            })
                            return;
                        }
                    } else if(cat.includes('Stunt')) {
                        if(member.includes('double')) {
                            if(!filmAlmanac.films[film.masterID].crew[cat]['Doubles']) filmAlmanac.films[film.masterID].crew[cat]['Doubles'] = [];
                            filmAlmanac.films[film.masterID].crew[cat]['Doubles'].push({
                                n: cleanMember,
                                c: cleanCredit.length > 0 ? cleanCredit : null,
                            })
                            return;
                        }
                    } else if(cat.includes('Make-up')) {
                        if(member.includes('makeup department head')) {
                            if(!filmAlmanac.films[film.masterID].crew[cat]['Head']) {
                                filmAlmanac.films[film.masterID].crew[cat]['Head'] = cleanMember;
                            } else {
                                filmAlmanac.films[film.masterID].crew[cat].p.push({
                                    n: cleanMember,
                                    c: cleanCredit.length > 0 ? cleanCredit : null,
                                })
                            }
                            return;
                        } else if(member.includes('hair') && !member.includes('makeup')) {
                            if(!filmAlmanac.films[film.masterID].crew[cat]['Hair']) filmAlmanac.films[film.masterID].crew[cat]['Hair'] = [];
                            filmAlmanac.films[film.masterID].crew[cat]['Hair'].push({
                                n: cleanMember,
                                c: cleanCredit.length > 0 ? cleanCredit : null,
                            })
                            return;
                        } else if(member.includes('prosthetic')) {
                            if(!filmAlmanac.films[film.masterID].crew[cat]['Prosthetics']) {
                                filmAlmanac.films[film.masterID].crew[cat]['Prosthetics'] = {
                                    p: []
                                };
                            }
                            if(member.includes('designer')) {
                                if(!filmAlmanac.films[film.masterID].crew[cat]['Prosthetics']['Designers']) filmAlmanac.films[film.masterID].crew[cat]['Prosthetics']['Designers'] = [];
                                filmAlmanac.films[film.masterID].crew[cat]['Prosthetics']['Designers'].push({
                                    n: cleanMember,
                                    c: cleanCredit.length > 0 ? cleanCredit : null,
                                })
                                return;
                            } else {
                                filmAlmanac.films[film.masterID].crew[cat]['Prosthetics'].p.push({
                                    n: cleanMember,
                                    c: cleanCredit.length > 0 ? cleanCredit : null,
                                })
                                return;
                            }
                        } else if(member.includes('makeup') && !member.includes('hair')) {
                            if(!filmAlmanac.films[film.masterID].crew[cat]['Makeup']) filmAlmanac.films[film.masterID].crew[cat]['Makeup'] = [];
                            filmAlmanac.films[film.masterID].crew[cat]['Makeup'].push({
                                n: cleanMember,
                                c: cleanCredit.length > 0 ? cleanCredit : null,
                            })
                            return;
                        }
                    }  else if(cat.includes('Transportation')) {
                        if(member.includes('driver')) {
                            if(!filmAlmanac.films[film.masterID].crew[cat]['Drivers']) filmAlmanac.films[film.masterID].crew[cat]['Drivers'] = [];
                            filmAlmanac.films[film.masterID].crew[cat]['Drivers'].push({
                                n: cleanMember,
                                c: cleanCredit.length > 0 ? cleanCredit : null,
                            })
                            return;
                        } else if(member.includes('coordinator')) {
                            if(!filmAlmanac.films[film.masterID].crew[cat]['Coordinators']) filmAlmanac.films[film.masterID].crew[cat]['Coordinators'] = [];
                            filmAlmanac.films[film.masterID].crew[cat]['Coordinators'].push({
                                n: cleanMember,
                                c: cleanCredit.length > 0 ? cleanCredit : null,
                            })
                            return;
                        }
                    } 
                }
                return {cleanMember, cleanCredit};
            }

            for(let i = 0; i < film.castInfo.cast.length; i++) {
                filmAlmanac.films[film.masterID].cast.push({
                    actor: film.castInfo.cast[i],
                    character: film.castInfo.characters[i],
                })
            }

            for(let i = 0; i < film.companyInfo.categoriesArray.length; i++) {
                if(film.companyInfo.categoriesArray[i].includes('Production')) {
                    filmAlmanac.films[film.masterID].company['production'] = film.companyInfo.categories[i];
                } else if(film.companyInfo.categoriesArray[i].includes('Distrib')) {
                    filmAlmanac.films[film.masterID].company['distributors'] = film.companyInfo.categories[i];
                } else if(film.companyInfo.categoriesArray[i].includes('SFX')) {
                    filmAlmanac.films[film.masterID].company['SFX'] = film.companyInfo.categories[i];
                } else if(film.companyInfo.categoriesArray[i].includes('Misce')) {
                    filmAlmanac.films[film.masterID].company['other'] = film.companyInfo.categories[i];
                }
            }

            for(let i = 0; i < film.crewInfo.categoriesArray.length; i++) {
                let entry;

                if(Array.isArray(film.crewInfo.categories[i])) {
                    
                    if(!filmAlmanac.films[film.masterID].crew[film.crewInfo.categoriesArray[i]]) {
                        filmAlmanac.films[film.masterID].crew[film.crewInfo.categoriesArray[i]] = {
                            p: [],
                        };
                    }

                    for(const member of film.crewInfo.categories[i]) {
                        
                        entry = crewCatcher(film.crewInfo.categoriesArray[i], member, true);

                        if(entry && entry.cleanMember.length > 0 && !filmAlmanac.films[film.masterID].crew[film.crewInfo.categoriesArray[i]].p.find(c => c.name == entry.cleanMember)) {
                            filmAlmanac.films[film.masterID].crew[film.crewInfo.categoriesArray[i]].p.push({
                                n: entry.cleanMember,
                                c: entry.cleanCredit.length > 0 ? entry.cleanCredit : null,
                            });
                        }
                    }
                } else {
                    entry = crewCatcher(film.crewInfo.categoriesArray[i], film.crewInfo.categories[i], false);
                    if(entry && entry.cleanMember.length > 0) filmAlmanac.films[film.masterID].crew[film.crewInfo.categoriesArray[i]] = entry.cleanMember;
                }
                
            }
           
        }
    }

    const download_txt = async (dataToSave) => {
        dataToSave = await film(dataToSave);
        const textToSave = await JSON.stringify(dataToSave);
        const hiddenElement = document.createElement('a');
        // hiddenElement.href = 'data:attachment/text,' + LZString.compressToEncodedURIComponent(textToSave);
        hiddenElement.href = 'data:attachment/text,' + encodeURI(textToSave);
        hiddenElement.target = '_blank';
        hiddenElement.download = 'myFile.txt';
        hiddenElement.click();
        
    }


</script>

<style>
    .bigBox {
        position: relative;
        display: inline-flex;
        flex-direction: column;
        z-index: auto;
        margin: 0.5em 0;
        width: 100%;
		background-color: var(--gcMain);
        overflow-y: auto;
        align-items: center;
    }

    .playContainer {
        width: 100%;
        position: relative;
        display: inline-flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background-color: var(--gcBox);
        margin: 0.3% 0;
        padding: 0.5% 0 0 0;
        border-radius: 1em;
        box-shadow: inset 0px 3px 3px -2px rgb(0 0 0 / 30%), inset 0px 3px 4px 0px rgb(0 0 0 / 28%), inset 0px 1px 3px 2px rgb(0 0 0 / 30%);
    }

    .playMainRow {
        display: inline-flex;
        background-color: var(--gcComponent);
        position: relative;
        padding: 0.5em;
        margin: 0.3% 1.5%;
        border-radius: 0.8em;
        font-size: 1.1em;
        font-weight: 420;
        width: 97%;
        align-items: center;
        justify-content: center;
        box-shadow: inset 0px 3px 3px -2px rgb(0 0 0 / 30%), inset 0px 3px 4px 0px rgb(0 0 0 / 28%), inset 0px 1px 3px 2px var(--gcScoreShadow);
    }

    .injury {
        display: inline-flex;
        align-items: center;
        position: relative;
        height: 44px;
        width: auto;
        margin: 0 0.2% 0 1.7%;
    }

    .pointsPositive {
        display: inline-flex;
        align-items: center;
        color: #0d6c0d;
        position: relative;
        padding: 0.5em 0 0.5em 0.5em;
        font-size: 1.1em;
        font-weight: 420;
    }

    .pointsNegative {
        display: inline-flex;
        align-items: center;
        color: #740404;
        position: relative;
        padding: 0.5em 0 0.5em 0.5em;
        font-size: 1.1em;
        font-weight: 420;
    }

    .noPlays {
        color: var(--gcPlayRowText);
    }

    .managerContainer {
        width: 45%;
        justify-content: flex-end;
        display: inline-flex;
        position: relative;
    }

    .manager {
        display: inline-flex;
        position: relative;
        width: 100%;
        color: var(--gcPlayRowText);
        justify-content: flex-end;
        align-items: center;
    }

    .playerAvatar {
        display: inline-flex;
        position: relative;
        align-items: center;
        width: 3.8em;
        margin: 0 0.5em;
        justify-content: center;
        height: fit-content;
        background-color: var(--gcComponent);
    }

    .defenseAvatar {
        display: inline-flex;
        position: relative;
        align-items: center;
        width: 2.6em;
        margin: 0 1.1em;
        justify-content: center;
        height: fit-content;
        background-color: var(--gcComponent);
    }

    .playerName {
        display: inline-flex;
        position: relative;
        align-items: center;
        width: 38%;
        color: var(--gcPlayRowText);
        justify-content: left;
        align-content: center;
    }

    .shortDescription {
        display: inline-flex;
        position: relative;
        align-items: center;
        width: 35%;
        color: var(--gcPlayRowText);
        justify-content: center;
        align-content: center;
        font-size: 0.9em;
        font-weight: 400;
        font-style: italic;
    }

    .description {
        display: inline-flex;
        position: relative;
        width: 96%;
        font-size: 0.85em;
        font-weight: 600;
        color: var(--gcPlayText);
        justify-content: center;
        align-content: center;
    }

    .modal {
        display: inline-flex;
        flex-direction: column;
        position: absolute; 
        z-index: 1; 
        width: 100%;
        height: 99%; 
        background-color: rgb(0,0,0); 
        background-color: rgba(0,0,0,0.8); 
        justify-content: center;
        align-items: center;
    }

    .columnWrap {
        display: inline-flex;
        position: relative;
        flex-direction: column;
        width: 100%;
        height: 100%;
        justify-content: center;
        align-items: center;
    }

    .modalContent {
        justify-content: center;
        align-items: center;
        color: #ededed;
    }

    #test {
        display:inline-flex;
        height: 50px;
        width: 50px;
    }

</style>

    <div class="bigBox">
        {#await fantasyProducts}
            <div class="columnWrap">
                Loading Fantasy Play by Play...
                <LinearProgress indeterminate />
            </div>
        {:then fantasyProducts}
            {#if newLoading}
                <div class="modal">
                    <div class="modalContent">Loading Fantasy Play by Play...</div>
                    <LinearProgress indeterminate />
                </div>
            {/if}
            {#if !fantasyProducts.fantasyProducts.length > 0}
                <div class="noPlays">No plays yet...</div>
            {:else}
                <div id="test" on:click={() => download_txt(filmData)}>Click Me</div>
                {#each filteredProducts as filteredProduct}
                    <div class="playContainer">
                        {#if filteredProduct[0] && filteredProduct[0]?.fpts != 0}
                            {#each filteredProduct as play}
                                <div class="playMainRow" style="{play.side == 'injury' ? "background-color: var(--gcInjury)" : null}">
                                    {#if play.side != 'injury'}
                                        <div class="{play.fpts > 0 ? "pointsPositive" : "pointsNegative"}">
                                            {#if play.fpts > 0}
                                                +{round(play.fpts)}
                                            {:else}
                                                {round(play.fpts)}
                                            {/if}
                                        </div>
                                    {:else}
                                        <img src="./injured.png" class="injury" alt="injury" />
                                    {/if}
                                    {#if play.side == 'offense' || play.side == 'injury'}
                                        <img class="playerAvatar" style="{play.side == 'injury' ? "background-color: var(--gcInjury)" : null}" src="{play.playerInfo ? play.playerInfo.avatar : "https://sleepercdn.com/images/v2/icons/player_default.webp"}" alt="{play.playerInfo ? play.playerInfo.ln : "Player"}">
                                    {:else}
                                        <img class="defenseAvatar" src="{play.playerInfo ? play.playerInfo.avatar : "https://sleepercdn.com/images/v2/icons/player_default.webp"}" alt="{play.playerInfo ? play.playerInfo.ln : "Player"}">
                                    {/if}
                                    <div class="playerName">{play.playerInfo.fn} {play.playerInfo.ln}</div>
                                    <div class="shortDescription">{play.shortDesc}</div>
                                    <div class="managerContainer">
                                        <div class="manager">{play.manager.name}</div>
                                    </div>
                                </div>
                            {/each}
                            <div class="description">
                                {filteredProduct[0]?.description}
                            </div>
                        {/if}
                    </div>
                {/each}
            {/if}
        {/await} 
    </div>
