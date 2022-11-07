import {parse, format} from "date-fns"
import ja from "date-fns/locale/ja"
import type {SvelteComponent} from "svelte";

export type Post = {
    slug: string;
    title: string;
    publishedAt: Date;
    publishedAtString: string;
    component: SvelteComponent;
};

const modules = import.meta.globEager("/src/posts/*.md");

function basename(path: string): string {
    return path.replace(/.*\//, '');
}

function removeMd(path: string): string {
    return path.replace(/\.md/, '')
}

export const posts: Post[] = Object.entries(modules).map(([filepath, module]) => {
    const slug = removeMd(basename(filepath));
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const {metadata} = module;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const svelteComponent = module.default;
    const publishedAt = parse(metadata.date, "yyyy-MM-dd HH:mm:ss", new Date(2000, 0, 1), {
        locale: ja
    })
    return {
        slug: slug,
        component: svelteComponent,
        title: metadata.title,
        publishedAt: publishedAt,
        publishedAtString: format(publishedAt, "yyyy-MM-dd", {locale: ja}),
    };
});
