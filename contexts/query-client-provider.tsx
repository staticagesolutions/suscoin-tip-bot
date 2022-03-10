import {
  QueryClient,
  QueryClientProvider as RQueryClientProvider,
} from "react-query";

const QueryClientProvider: React.FC = ({ children }) => {
  const queryClient = new QueryClient();
  return (
    <RQueryClientProvider client={queryClient}>{children}</RQueryClientProvider>
  );
};

export default QueryClientProvider;
