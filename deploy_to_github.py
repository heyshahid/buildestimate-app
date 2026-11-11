import urllib.request
import urllib.error
import json
import base64
import os
import time

token = os.environ.get('GITHUB_TOKEN') or os.environ.get('GH_TOKEN') or ''
if not token:
    print("Notice: GITHUB_TOKEN environment variable not detected. Please provide a valid token to push to GitHub.")
repo_name = 'buildestimate-app'
owner = 'heyshahid'
headers = {
    'Authorization': f'token {token}',
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
}

# 1. Create Repository if it doesn't exist
create_url = 'https://api.github.com/user/repos'
repo_data = {
    'name': repo_name,
    'description': 'Mobile-First Construction Material Takeoff & Project Cost Estimator (PWA for iOS, Android & Desktop)',
    'private': False,
    'has_issues': True,
    'has_projects': True,
    'has_wiki': False
}

try:
    req = urllib.request.Request(create_url, data=json.dumps(repo_data).encode('utf-8'), headers=headers, method='POST')
    with urllib.request.urlopen(req) as resp:
        print(f"Repository {repo_name} created successfully!")
except urllib.error.HTTPError as e:
    if e.code == 422:
        print(f"Repository {repo_name} already exists. Continuing to push files...")
    else:
        print("Create repo error:", e.code, e.read().decode('utf-8', errors='ignore'))

time.sleep(2)

# 2. Upload Files to the Repository
base_dir = r'D:\BuildEstimate'
files_to_upload = [
    ('README.md', 'README.md', False),
    ('index.html', 'index.html', False),
    ('manifest.json', 'manifest.json', False),
    ('sw.js', 'sw.js', False),
    (os.path.join('icons', 'icon.svg'), 'icons/icon.svg', False),
    (os.path.join('icons', 'icon-192.png'), 'icons/icon-192.png', True),
    (os.path.join('icons', 'icon-512.png'), 'icons/icon-512.png', True)
]

for local_rel, gh_path, is_binary in files_to_upload:
    full_path = os.path.join(base_dir, local_rel)
    if not os.path.exists(full_path):
        print(f"File missing: {full_path}")
        continue

    if is_binary:
        with open(full_path, 'rb') as f:
            b64_content = base64.b64encode(f.read()).decode('utf-8')
    else:
        with open(full_path, 'r', encoding='utf-8') as f:
            b64_content = base64.b64encode(f.read().encode('utf-8')).decode('utf-8')

    content_url = f'https://api.github.com/repos/{owner}/{repo_name}/contents/{gh_path}'
    
    # Check if file exists to get SHA
    sha = None
    try:
        get_req = urllib.request.Request(content_url, headers=headers)
        with urllib.request.urlopen(get_req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            sha = data.get('sha')
    except urllib.error.HTTPError:
        sha = None

    payload = {
        'message': f'Add/Update {gh_path} - BuildEstimate Pro',
        'content': b64_content,
        'branch': 'main'
    }
    if sha:
        payload['sha'] = sha

    for attempt in range(5):
        try:
            put_req = urllib.request.Request(content_url, data=json.dumps(payload).encode('utf-8'), headers=headers, method='PUT')
            with urllib.request.urlopen(put_req, timeout=20) as resp:
                print(f"SUCCESS: Pushed {gh_path} (HTTP {resp.status})")
                break
        except Exception as e:
            print(f"Attempt {attempt+1} failed for {gh_path}: {e}")
            time.sleep(2)

print("\nAll files uploaded to GitHub!")
print(f"Repository URL: https://github.com/{owner}/{repo_name}")
