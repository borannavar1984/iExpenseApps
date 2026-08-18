// GitHub cloud sync service - mirrors web app sync pattern
// Handles pushing/pulling entries, net worth, and insurance data

import { Entry, NWSnapshot, InsuranceSnapshot, generateId } from './dataModel';

export interface CloudConfig {
  owner: string; // GitHub username
  repo: string; // Repo name
  token: string; // Personal Access Token
}

export interface SyncResult {
  success: boolean;
  message: string;
  merged?: any[];
  error?: string;
}

// ============== GITHUB API CALLS ==============

async function getFileFromGitHub(
  owner: string,
  repo: string,
  path: string,
  token: string
): Promise<{ content: string; sha: string } | null> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3.raw',
        },
      }
    );

    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);

    const text = await response.text();

    // Get SHA for this commit
    const metaResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );
    const meta = await metaResponse.json();

    return {
      content: text,
      sha: meta.sha,
    };
  } catch (error) {
    console.error(`Failed to fetch ${path}:`, error);
    return null;
  }
}

async function updateFileOnGitHub(
  owner: string,
  repo: string,
  path: string,
  content: string,
  sha: string,
  token: string,
  message: string,
  retries: number = 3
): Promise<boolean> {
  try {
    const contentBase64 = Buffer.from(content).toString('base64');

    for (let attempt = 0; attempt < retries; attempt++) {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            content: contentBase64,
            sha,
          }),
        }
      );

      if (response.status === 200 || response.status === 201) {
        return true;
      }

      if (response.status === 409) {
        // Conflict: fetch latest SHA and retry
        console.log(`Conflict on attempt ${attempt + 1}, retrying...`);
        const latest = await getFileFromGitHub(owner, repo, path, token);
        if (latest) {
          // Merge and retry
          const retryContent = await mergeAndGetContent(
            content,
            latest.content,
            path
          );
          if (attempt < retries - 1) {
            // Continue loop with updated SHA
            const response2 = await fetch(
              `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
              {
                method: 'PUT',
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  message,
                  content: Buffer.from(retryContent).toString('base64'),
                  sha: latest.sha,
                }),
              }
            );
            if (response2.ok) return true;
          }
        }
      } else {
        throw new Error(`GitHub API error: ${response.status}`);
      }
    }

    return false;
  } catch (error) {
    console.error(`Failed to update ${path}:`, error);
    return false;
  }
}

// ============== MERGE LOGIC ==============

export function unionMerge<T extends { id: string }>(
  remote: T[],
  local: T[],
  deletedIds: Set<string>
): T[] {
  // Union merge: remote + local, deduplicated by ID, minus deleted
  const merged: { [id: string]: T } = {};

  // Start with remote
  remote.forEach((item) => {
    if (!deletedIds.has(item.id)) {
      merged[item.id] = item;
    }
  });

  // Add local (overwrites remote if ID matches)
  local.forEach((item) => {
    if (!deletedIds.has(item.id)) {
      merged[item.id] = item;
    }
  });

  return Object.values(merged);
}

async function mergeAndGetContent(
  localContent: string,
  remoteContent: string,
  filetype: string
): Promise<string> {
  try {
    const localData = JSON.parse(localContent);
    const remoteData = JSON.parse(remoteContent);

    if (filetype.includes('entries')) {
      // Merge entries
      const merged = unionMerge(
        remoteData,
        localData,
        new Set<string>()
      );
      return JSON.stringify(merged, null, 1);
    } else if (filetype.includes('networth') || filetype.includes('insurance')) {
      // Merge snapshots
      const remoteSnaps = remoteData.snapshots || [];
      const localSnaps = localData.snapshots || [];

      const mergedSnaps = unionMerge(
        remoteSnaps,
        localSnaps,
        new Set<string>(localData.deletedIds || [])
      );

      return JSON.stringify(
        {
          snapshots: mergedSnaps,
          changeLog: [
            ...(remoteData.changeLog || []),
            ...(localData.changeLog || []),
          ],
        },
        null,
        1
      );
    }

    return localContent;
  } catch (error) {
    console.error('Merge failed, using local:', error);
    return localContent;
  }
}

// ============== SYNC OPERATIONS ==============

export async function syncEntries(
  entries: Entry[],
  config: CloudConfig
): Promise<SyncResult> {
  try {
    const remote = await getFileFromGitHub(
      config.owner,
      config.repo,
      'entries.json',
      config.token
    );

    if (!remote) {
      // File doesn't exist, create it
      const success = await updateFileOnGitHub(
        config.owner,
        config.repo,
        'entries.json',
        JSON.stringify(entries, null, 1),
        '',
        config.token,
        'Initial entries sync from mobile'
      );

      return {
        success,
        message: success
          ? 'Created entries.json on GitHub'
          : 'Failed to create entries.json',
        merged: success ? entries : [],
      };
    }

    // Merge
    const remoteData = JSON.parse(remote.content);
    const merged = unionMerge(remoteData, entries, new Set<string>());

    // Upload merged
    const success = await updateFileOnGitHub(
      config.owner,
      config.repo,
      'entries.json',
      JSON.stringify(merged, null, 1),
      remote.sha,
      config.token,
      'Sync entries from mobile'
    );

    return {
      success,
      message: success ? 'Synced entries' : 'Failed to sync entries',
      merged: success ? merged : [],
    };
  } catch (error) {
    return {
      success: false,
      message: 'Sync error',
      error: String(error),
    };
  }
}

export async function syncNetWorth(
  snapshots: NWSnapshot[],
  changeLog: any[],
  config: CloudConfig
): Promise<SyncResult> {
  try {
    const remote = await getFileFromGitHub(
      config.owner,
      config.repo,
      'networth.json',
      config.token
    );

    const payload = { snapshots, changeLog };

    if (!remote) {
      const success = await updateFileOnGitHub(
        config.owner,
        config.repo,
        'networth.json',
        JSON.stringify(payload, null, 1),
        '',
        config.token,
        'Initial net worth sync from mobile'
      );

      return {
        success,
        message: success
          ? 'Created networth.json on GitHub'
          : 'Failed to create networth.json',
      };
    }

    // Merge snapshots
    const remoteData = JSON.parse(remote.content);
    const mergedSnaps = unionMerge(
      remoteData.snapshots || [],
      snapshots,
      new Set<string>()
    );

    const merged = {
      snapshots: mergedSnaps,
      changeLog: [...(remoteData.changeLog || []), ...changeLog],
    };

    const success = await updateFileOnGitHub(
      config.owner,
      config.repo,
      'networth.json',
      JSON.stringify(merged, null, 1),
      remote.sha,
      config.token,
      'Sync net worth from mobile'
    );

    return {
      success,
      message: success ? 'Synced net worth' : 'Failed to sync net worth',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Sync error',
      error: String(error),
    };
  }
}

export async function syncInsurance(
  snapshots: InsuranceSnapshot[],
  changeLog: any[],
  config: CloudConfig
): Promise<SyncResult> {
  try {
    const remote = await getFileFromGitHub(
      config.owner,
      config.repo,
      'insurance.json',
      config.token
    );

    const payload = { snapshots, changeLog };

    if (!remote) {
      const success = await updateFileOnGitHub(
        config.owner,
        config.repo,
        'insurance.json',
        JSON.stringify(payload, null, 1),
        '',
        config.token,
        'Initial insurance sync from mobile'
      );

      return {
        success,
        message: success
          ? 'Created insurance.json on GitHub'
          : 'Failed to create insurance.json',
      };
    }

    // Merge snapshots
    const remoteData = JSON.parse(remote.content);
    const mergedSnaps = unionMerge(
      remoteData.snapshots || [],
      snapshots,
      new Set<string>()
    );

    const merged = {
      snapshots: mergedSnaps,
      changeLog: [...(remoteData.changeLog || []), ...changeLog],
    };

    const success = await updateFileOnGitHub(
      config.owner,
      config.repo,
      'insurance.json',
      JSON.stringify(merged, null, 1),
      remote.sha,
      config.token,
      'Sync insurance from mobile'
    );

    return {
      success,
      message: success ? 'Synced insurance' : 'Failed to sync insurance',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Sync error',
      error: String(error),
    };
  }
}

export async function pullFromCloud(
  config: CloudConfig
): Promise<{
  entries: Entry[];
  nwSnapshots: NWSnapshot[];
  insSnapshots: InsuranceSnapshot[];
}> {
  try {
    const [entriesFile, nwFile, insFile] = await Promise.all([
      getFileFromGitHub(config.owner, config.repo, 'entries.json', config.token),
      getFileFromGitHub(config.owner, config.repo, 'networth.json', config.token),
      getFileFromGitHub(config.owner, config.repo, 'insurance.json', config.token),
    ]);

    return {
      entries: entriesFile ? JSON.parse(entriesFile.content) : [],
      nwSnapshots: nwFile ? (JSON.parse(nwFile.content).snapshots || []) : [],
      insSnapshots: insFile ? (JSON.parse(insFile.content).snapshots || []) : [],
    };
  } catch (error) {
    console.error('Pull from cloud failed:', error);
    return { entries: [], nwSnapshots: [], insSnapshots: [] };
  }
}
