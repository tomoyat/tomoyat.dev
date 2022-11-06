import type {PageLoad} from './$types';
import {posts} from '$lib/posts'

export const load: PageLoad = async ({params}) => {
    return {
        posts
    };
}
