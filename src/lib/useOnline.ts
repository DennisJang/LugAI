import * as Network from 'expo-network';
import { useEffect, useState } from 'react';

/** 인터넷 연결 여부. expo-network 상태 구독. 실패 시 온라인으로 간주. */
export function useOnline(): boolean {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    let mounted = true;
    const apply = (s: Network.NetworkState) => {
      if (mounted) setOnline(s.isInternetReachable ?? s.isConnected ?? true);
    };
    Network.getNetworkStateAsync().then(apply).catch(() => {});
    const sub = Network.addNetworkStateListener(apply);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  return online;
}
