import { createContext, useContext } from "react";

/** Opens the create dialog. Provided by App so the header, the page and the empty state share one form. */
export const NewTaskContext = createContext<() => void>(() => {});

export const useNewTask = () => useContext(NewTaskContext);
