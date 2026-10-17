import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { API_BASE, apiFetch } from './api';

export function useAdminData(path) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`${API_BASE}/admin${path}`);
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || 'Could not load');
      setData(json);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    relooad();
  }, [reload]);

  return { data, loading, reload };
}


export async function adminAction(method, path, body) {
  const res = await apiFetch(`${API_BASE}/admin${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Action failed');
  return json;
}


export function useRunner(reload) {
  const [busyId, setBusyId] = useState(null);

  async function run(id, request, okMessage) {
    setBusyId(id);
    try {
      await request();
      toast.success(okMessage);
      await reload();
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    } finally {
      setBusyId(null);
    }
  }

  return { busyId, run };
}