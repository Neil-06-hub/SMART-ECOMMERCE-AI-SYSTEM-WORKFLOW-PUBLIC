'use client';

import { AntdRegistry } from '@ant-design/nextjs-registry';
import { App as AntApp, ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { antdTheme } from './antd-theme';

export default function Providers({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,        // 1 phút — tránh refetch quá thường xuyên
            gcTime: 5 * 60 * 1000,       // giữ cache 5 phút sau khi unmount
            retry: 1,
            refetchOnWindowFocus: false, // tắt refetch mỗi khi chuyển tab quay lại
          },
        },
      })
  );

  return (
    <AntdRegistry>
      <ConfigProvider locale={viVN} theme={antdTheme}>
        <AntApp
          message={{ maxCount: 3, duration: 2.2 }}
          notification={{ placement: 'topRight', duration: 3.2 }}
        >
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </AntApp>
      </ConfigProvider>
    </AntdRegistry>
  );
}
