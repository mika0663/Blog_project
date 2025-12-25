// lib/apollo/client.ts
import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { createClient } from "@/lib/supabase/client"; // <- your existing client.ts

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "[Apollo Client] Missing Supabase environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set."
  );
}

// GraphQL endpoint
const httpLink = new HttpLink({
  uri: supabaseUrl ? `${supabaseUrl}/graphql/v1` : "",
});

// Error link for better error handling
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
    if ('statusCode' in networkError) {
      console.error(`Status code: ${networkError.statusCode}`);
    }
  }
});

// Auth link for Apollo to include Supabase JWT in headers
const authLink = setContext(async (_, { headers }) => {
  try {
    const supabase = createClient();

    // Get the current session (JWT)
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return {
      headers: {
        ...headers,
        "apikey": supabaseAnonKey || "",
        "Authorization": session ? `Bearer ${session.access_token}` : `Bearer ${supabaseAnonKey || ""}`,
      },
    };
  } catch (error) {
    console.error("[Apollo Client] Error getting session:", error);
    return {
      headers: {
        ...headers,
        "apikey": supabaseAnonKey || "",
        "Authorization": `Bearer ${supabaseAnonKey || ""}`,
      },
    };
  }
});

// Create Apollo client
export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: "all",
    },
    query: {
      errorPolicy: "all",
    },
  },
});
