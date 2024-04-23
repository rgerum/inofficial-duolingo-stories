import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";

export default function useSearchParamsState(name, default_value) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [state, setState] = React.useState(
    searchParams.get(name) || default_value,
  );

  // Get a new searchParams string by merging the current
  // searchParams with a provided key/value pair
  const createQueryString = React.useCallback(
    (name, value) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams],
  );

  //const highlight_name = useSearchParams().get("highlight_name");
  function setStateWrapped(value) {
    router.push(pathname + "?" + createQueryString(name, value));
    setState(value);
  }
  return [state, setStateWrapped];
}
