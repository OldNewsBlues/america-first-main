// Indexed by Sleeper player_id
// espnID: for fetching rosters, stats, scores, etc. from ESPN
export const nflTeams = {           
    ARI: {
        espnID: 22,
        sleeperID: "ARI",
        espnAbbreviation: 'ARZ',
        fn: "Arizona",
        ln: "Cardinals",
        color: "A40227",
        alternateColor: "000000",
        status: "active",
    },
    ATL: {
        espnID: 1,
        sleeperID: "ATL",
        espnAbbreviation: 'ATL',
        fn: "Atlanta",
        ln: "Falcons",
        color: "000000",
        alternateColor: "000000",
        status: "active",
    },
    BAL: {
        espnID: 33,
        sleeperID: "BAL",
        espnAbbreviation: 'BLT',
        fn: "Baltimore",
        ln: "Ravens",
        color: "2B025B",
        alternateColor: "9e7c0c",
        status: "active",
    },
    BUF: {
        espnID: 2,
        sleeperID: "BUF",
        espnAbbreviation: 'BUF',
        fn: "Buffalo",
        ln: "Bills",
        color: "04407F",
        alternateColor: "c60c30",
        status: "active",
    },
    CAR: {
        espnID: 29,
        sleeperID: "CAR",
        espnAbbreviation: 'CAR',
        fn: "Carolina",
        ln: "Panthers",
        color: "2177B0",
        alternateColor: "bfc0bf",
        status: "active",
    },
    CHI: {
        espnID: 3,
        sleeperID: "CHI",
        espnAbbreviation: 'CHI',
        fn: "Chicago",
        ln: "Bears",
        color: "152644",
        alternateColor: "0b162a",
        status: "active",
    },
    CIN: {
        espnID: 4,
        sleeperID: "CIN",
        espnAbbreviation: 'CIN',
        fn: "Cincinnati",
        ln: "Bengals",
        color: "FF2700",
        alternateColor: "000000",
        status: "active",
    },
    CLE: {
        espnID: 5,
        sleeperID: "CLE",
        espnAbbreviation: 'CLV',
        fn: "Cleveland",
        ln: "Browns",
        color: "4C230E",
        alternateColor: "4c230e",
        status: "active",
    },
    DAL: {
        espnID: 6,
        sleeperID: "DAL",
        espnAbbreviation: 'DAL',
        fn: "Dallas",
        ln: "Cowboys",
        color: "002E4D",
        alternateColor: "b0b7bc",
        status: "active",
    },
    DEN: {
        espnID: 7,
        sleeperID: "DEN",
        espnAbbreviation: 'DEN',
        fn: "Denver",
        ln: "Broncos",
        color: "002E4D",
        alternateColor: "fb4f14",
        status: "active",
    },
    DET: {
        espnID: 8,
        sleeperID: "DET",
        espnAbbreviation: 'DET',
        fn: "Detroit",
        ln: "Lions",
        color: "035C98",
        alternateColor: "b0b7bc",
        status: "active",
    },
    GB: {
        espnID: 9,
        sleeperID: "GB",
        espnAbbreviation: 'GB',
        fn: "Green Bay",
        ln: "Packers",
        color: "204E32",
        alternateColor: "ffb612",
        status: "active",
    },
    HOU: {
        espnID: 34,
        sleeperID: "HOU",
        espnAbbreviation: 'HST',
        fn: "Houston",
        ln: "Texans",
        color: "00133F",
        alternateColor: "a71930",
        status: "active",
    },
    IND: {
        espnID: 11,
        sleeperID: "IND",
        espnAbbreviation: 'IND',
        fn: "Indianapolis",
        ln: "Colts",
        color: "00417E",
        alternateColor: "ffffff",
        status: "active",
    },
    JAX: {
        espnID: 30,
        sleeperID: "JAX",
        espnAbbreviation: 'JAX',
        fn: "Jacksonville",
        ln: "Jaguars",
        color: "00839C",
        alternateColor: "000000",
        status: "active",
    },
    KC: {
        espnID: 12,
        sleeperID: "KC",
        espnAbbreviation: 'KC',
        fn: "Kansas City",
        ln: "Chiefs",
        color: "BE1415",
        alternateColor: "e31837",
        status: "active",
    },
    LAC: {
        espnID: 24,
        sleeperID: "LAC",
        espnAbbreviation: 'LAC',
        fn: "Los Angeles",
        fn2: ["San Diego", "SD", 2016],
        ln: "Chargers",
        color: "042453",
        alternateColor: "0073cf",
        status: "active",
    },
    LAR: {
        espnID: 14,
        sleeperID: "LAR",
        espnAbbreviation: 'LA',
        fn: "Los Angeles",
        fn2: ["St. Louis", "STL", 2015],
        ln: "Rams",
        color: "00295B",
        alternateColor: "b3995d",
        status: "active",
    },
    LV: {
        espnID: 13,
        sleeperID: "LV",
        espnAbbreviation: 'LV',
        fn: "Las Vegas",
        fn2: ["Oakland", "OAK", 2019],
        ln: "Raiders",
        color: "000000",
        alternateColor: "a5acaf",
        status: "active",
    },
    MIA: {
        espnID: 15,
        sleeperID: "MIA",
        espnAbbreviation: 'MIA',
        fn: "Miami",
        ln: "Dolphins",
        color: "006B79",
        alternateColor: "005778",
        status: "active",
    },
    MIN: {
        espnID: 16,
        sleeperID: "MIN",
        espnAbbreviation: 'MIN',
        fn: "Minnesota",
        ln: "Vikings",
        color: "240A67",
        alternateColor: "ffc62f",
        status: "active",
    },
    NE: {
        espnID: 17,
        sleeperID: "NE",
        espnAbbreviation: 'NE',
        fn: "New England",
        ln: "Patriots",
        color: "02244A",
        alternateColor: "b0b7bc",
        status: "active",
    },
    NO: {
        espnID: 18,
        sleeperID: "NO",
        espnAbbreviation: 'NO',
        fn: "New Orleans",
        ln: "Saints",
        color: "020202",
        alternateColor: "000000",
        status: "active",
    },
    NYG: {
        espnID: 19,
        sleeperID: "NYG",
        espnAbbreviation: 'NYG',
        fn: "New York",
        ln: "Giants",
        color: "052570",
        alternateColor: "ffffff",
        status: "active",
    },
    NYJ: {
        espnID: 20,
        sleeperID: "NYJ",
        espnAbbreviation: 'NYJ',
        fn: "New York",
        ln: "Jets",
        color: "174032",
        alternateColor: "ffffff",
        status: "active",
    },
    // OAK: {
    //     espnID: 13,
    //     sleeperID: "OAK",
    //     fn: "Oakland",
    //     ln: "Raiders",
    //     color: "000000",
    //     alternateColor: "a5acaf",
    //     status: "inactive",
    //     lastActive: 2019,
    // },
    PHI: {
        espnID: 21,
        sleeperID: "PHI",
        espnAbbreviation: 'PHI',
        fn: "Philadelphia",
        ln: "Eagles",
        color: "06424D",
        alternateColor: "a5acaf",
        status: "active",
    },
    PIT: {
        espnID: 23,
        sleeperID: "PIT",
        espnAbbreviation: 'PIT',
        fn: "Pittsburgh",
        ln: "Steelers",
        color: "000000",
        alternateColor: "ffb612",
        status: "active",
    },
    SEA: {
        espnID: 26,
        sleeperID: "SEA",
        espnAbbreviation: 'SEA',
        fn: "Seattle",
        ln: "Seahawks",
        color: "224970",
        alternateColor: "69be28",
        status: "active",
    },
    SF: {
        espnID: 25,
        sleeperID: "SF",
        espnAbbreviation: 'SF',
        fn: "San Francisco",
        ln: "49ers",
        color: "981324",
        alternateColor: "b3995d",
        status: "active",
    },
    TB: {
        espnID: 27,
        sleeperID: "TB",
        espnAbbreviation: 'TB',
        fn: "Tampa Bay",
        ln: "Buccaneers",
        color: "A80D08",
        alternateColor: "34302b",
        status: "active",
    },
    TEN: {
        espnID: 10,
        sleeperID: "TEN",
        espnAbbreviation: 'TEN',
        fn: "Tennessee",
        fn2: ["Houston", "HOU", 1996],
        ln: "Titans",
        ln2: ["Oilers", 1998],
        color: "2F95DD",
        alternateColor: "4b92db",
        status: "active",
    },
    WAS: {
        espnID: 28,
        sleeperID: "WAS",
        espnAbbreviation: 'WAS',
        fn: "Washington",
        ln: "Football Team",
        ln2: ["Redskins", 2018],
        color: "650415",
        alternateColor: "650415",
        status: "active",
    },

}