import boto3
import os
from pathlib import Path
from logging import basicConfig, getLogger, INFO

basicConfig(level=INFO)
logger = getLogger(__name__)


def get_targets():
    return [p for p in Path('.').glob('**/*') if p.is_file()]

def object_cache_setting(path):
    if path.match('*.html'):
        return "public, max-age=0, must-revalidate"

    if path.name in ['_app/version.json', 'vite-manifest.json']:
        return "public, max-age=0, must-revalidate"

    if path.name in ['favicon.png']:
        return "public, max-age=86400"

    return "public, max-age=86400, immutable"

def object_content_type(path):
    if path.suffix in ['.html']:
        return 'text/html'
    if path.suffix in ['.ico']:
        return 'image/vnd.microsoft.icon'
    if path.suffix in ['.jpg', 'jpeg']:
        return 'image/jpeg'
    if path.suffix in ['.png']:
        return 'image/png'
    if path.suffix in ['.svg']:
        return 'image/svg+xml'
    if path.suffix in ['.js']:
        return 'text/javascript'
    if path.suffix in ['.css']:
        return 'text/css'
    if path.suffix in ['.json', '.map']:
        return 'application/json'
    if path.suffix in ['.txt']:
        return 'text/plain'

    return 'application/octet-stream'

def run():
    os.chdir("./build")

    target_paths = get_targets()

    s3 = boto3.resource('s3')
    bucket = s3.Bucket('tomoyat.dev')
    object_summary_iterator = bucket.objects.all()

    exists_file = {}
    for object_summary in object_summary_iterator:
        exists_file[object_summary.key] = object_summary


    for target in target_paths:
        cache_string = object_cache_setting(target)
        content_type = object_content_type(target)
        logger.info(f"upload target| file:{os.fspath(target)}, type:{content_type}, cahce:{cache_string}")

        with target.open('rb') as f:
            key = os.fspath(target)
            bucket.put_object(Key=key, Body=f, ContentType=content_type, CacheControl=cache_string)
            if key in exists_file:
                exists_file.pop(key)

    for k, o in exists_file.items():
        logger.info(f"delete| key:{k}")
        o.delete()


if __name__ == "__main__":
    run()
