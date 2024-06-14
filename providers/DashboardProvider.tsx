"use client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { nanoid } from "nanoid";
import {
  Dispatch,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { RxCross1 } from "react-icons/rx";

export enum AlertStatus {
  Info = "info",
  Error = "error",
  Success = "success",
  Warning = "warning",
}

type AlertQueue = Array<{
  id: string;
  message: string;
  status: AlertStatus;
  deltaExpiresAt: number;
}>;

type DashboardContextProps = {
  search: string | null;
  alertQueue: AlertQueue;

  actions: {
    clearAlertQueue: () => void;
    appendAlertToQueue: (alert: string, status?: AlertStatus) => void;

    setSearchValue: Dispatch<SetStateAction<string | null>>;
  };
};
const DashboardContext = createContext<DashboardContextProps>({
  search: null,
  alertQueue: [],

  actions: {
    clearAlertQueue: () => {},
    appendAlertToQueue: (alert: string) => {},

    setSearchValue: () => {},
  },
});

export const useDashboardContext = function () {
  if (typeof DashboardContext === "undefined") {
    console.log("You cannot you the hook outside of DashboardProvider.");
  }

  return useContext(DashboardContext);
};

export const useSearchValue = function () {
  return useDashboardContext().search;
};

export const useSetSearchValue = function () {
  return useDashboardContext().actions.setSearchValue;
};

export const useAppendAlertToQueue = () => {
  return useDashboardContext().actions.appendAlertToQueue;
};

export default function DashboardProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [search, setSearch] = useState<string | null>(null);
  const [alertQueue, setAlertQueue] = useState<AlertQueue>([]);

  const clearAlertQueue = () => setAlertQueue([]);

  const getAlertStatusColor = (
    status: AlertStatus,
  ): { color: string; background: string } | null => {
    switch (status) {
      case AlertStatus.Error:
        return {
          color: "text-red-800",
          background: "bg-red-50",
        };
      case AlertStatus.Info:
        return {
          color: "text-blue-800",
          background: "bg-blue-50",
        };
      case AlertStatus.Success:
        return {
          color: "text-green-800",
          background: "bg-green-50",
        };
      case AlertStatus.Warning:
        return {
          color: "text-yellow-800",
          background: "bg-yellow-50",
        };
      default:
        return null;
    }
  };

  const removeAlertFromQueue = (id: string) => {
    setAlertQueue([...alertQueue].filter((alert) => alert.id !== id));
  };

  const appendAlertToQueue = (
    alert: string,
    status: AlertStatus = AlertStatus.Info,
  ) => {
    setAlertQueue((alertQueue) => [
      {
        id: nanoid(),
        message: alert,
        status: status,
        deltaExpiresAt: Date.now() + 5000,
      },
      ...alertQueue.slice(0, 3),
    ]);
  };

  useEffect(
    function () {
      let intervalId = setInterval(() => {
        alertQueue.forEach((alert) => {
          if (alert.deltaExpiresAt < Date.now()) {
            removeAlertFromQueue(alert.id);
          }
        });
      }, 500);

      return () => clearInterval(intervalId);
    },
    [alertQueue],
  );

  const actions = useCallback((): DashboardContextProps["actions"] => {
    return {
      clearAlertQueue,
      appendAlertToQueue,
      setSearchValue: setSearch,
    };
  }, [])();

  return (
    <DashboardContext.Provider value={{ search, alertQueue, actions }}>
      {children}

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 top-0 z-50 h-screen w-screen overflow-hidden">
        <div className="relative h-full w-full">
          <div className="pointer-events-auto absolute bottom-0 right-0 flex flex-col items-end gap-4 p-4 pr-6">
            {alertQueue.map((alert) => {
              const toast = getAlertStatusColor(alert.status);

              return (
                <div
                  className="toastLifeCycle w-max transition-all"
                  key={alert.id}
                >
                  <Alert className={cn(toast?.background)}>
                    <div className="flex flex-wrap items-center gap-2">
                      <AlertDescription className={cn(toast?.color)}>
                        {alert.message}
                      </AlertDescription>
                      <RxCross1
                        onClick={() => removeAlertFromQueue(alert.id)}
                        className="cursor-pointer"
                      />
                    </div>
                  </Alert>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardContext.Provider>
  );
}
