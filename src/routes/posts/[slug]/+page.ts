import {fetchPage} from '$lib/posts'

export const load = async ({params}) => {
    const post = await fetchPage(params.slug);
    return {
        post: post,
        slug: params.slug,
    };
}
