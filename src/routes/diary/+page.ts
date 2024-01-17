import {posts} from '$lib/posts'

export const load = async ({params}) => {
    return {
        posts: posts
    };
}
