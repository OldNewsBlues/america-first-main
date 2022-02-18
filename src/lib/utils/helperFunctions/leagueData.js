import { get } from 'svelte/store';
import {leagueData} from '$lib/stores';
import { leagueID } from '$lib/utils/leagueInfo';

let queryLeagueID = leagueID;
export const getLeagueData = async (queryLeagueID) => {
	if(get(leagueData)[queryLeagueID]) return get(leagueData)[queryLeagueID];
	
    const res = await fetch(`https://api.sleeper.app/v1/league/${queryLeagueID}`, {compress: true}).catch((err) => { console.error(err); });
	const data = await res.json().catch((err) => { console.error(err); });
	
	if (res.ok) {
		leagueData.update(ld => {ld[queryLeagueID] = data; return ld}); 
		return data;
	} else {
		throw new Error(data);
	}
}