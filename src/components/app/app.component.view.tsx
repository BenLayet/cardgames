import { useSofter } from "@softer-components/redux-adapter";
import { useEffect } from "react";

import type {AppContract} from "./app.component";

export const View = ({ path = "" }) => {
  const [, d, ] = useSofter<AppContract>(path);
  useEffect(() => {
    d.displayed();
  }, [d]);
  return (
    <div>
        <h1>App Component</h1>
    </div>
  );
};
