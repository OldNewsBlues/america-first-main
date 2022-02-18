import { get } from 'svelte/store';
import {players} from '$lib/stores';
import { creationYear, LZString } from '$lib/utils/helper'

export const loadPlayers = async (refresh = false) => {     
	if(get(players)[1426]) {
		return {
            players: get(players),
            stale: false
        };
	} 
    // comment out lines 13-24 to force refresh of playersInfo
    const now = Math.round(new Date().getTime() / 1000);
    const playersInfoCompressed = await localStorage.getItem("playersInfo");
    const newString = await  LZString.decompressFromUTF16(playersInfoCompressed);
    const playersInfo = JSON.parse(newString);
    let expiration = parseInt(localStorage.getItem("expiration"));

    if(playersInfo && playersInfo[1426] && expiration && now > expiration && !refresh) {
        return {
            players: playersInfo,
            stale: true
        }
    }
    // uncomment following line (26) to force refresh of playersInfo
    // let playersInfo, expiration, now;

    if(!playersInfo || !expiration || now > expiration) {
        const res = await fetch(`/api/fetch_players_info`, {compress: true});
        const data = await res.json();
        const string = await JSON.stringify(data);
        const dataCompressed = await LZString.compressToUTF16(string);
        


        if (!res.ok) {
            throw new Error(data);
        }

        localStorage.setItem("playersInfo", dataCompressed);
        

        const ts = Math.round(new Date().getTime() / 1000);
        const newExpiration = ts + (24 * 3600);

        localStorage.setItem("expiration", newExpiration)  

		players.update(() => data);

        return {
            players: data,
            stale: false
        };
    }
    players.update(() => playersInfo);
    return {
        players: playersInfo,
        stale: false
    };
}