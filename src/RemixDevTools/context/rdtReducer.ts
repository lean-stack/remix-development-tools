import { TimelineEvent } from "./timeline";
import type { Tabs } from "../tabs";

export type RouteWildcards = Record<string, Record<string, string> | undefined>;

export type RemixDevToolsState = {
  timeline: TimelineEvent[];
  settings: {
    routeWildcards: RouteWildcards;
    activeTab: Tabs;
    shouldConnectWithForge: boolean;
    port: number;
    height: number;
  };
};

export const initialState: RemixDevToolsState = {
  timeline: [],
  settings: {
    routeWildcards: {},
    activeTab: "timeline",
    shouldConnectWithForge: false,
    port: 3003,
    height: 400,
  },
};

export type ReducerActions = Pick<RemixDevToolsActions, "type">["type"];

/** Reducer action types */
type SetTimelineEvent = {
  type: "SET_TIMELINE_EVENT";
  payload: TimelineEvent;
};

type SetActiveTab = {
  type: "SET_ACTIVE_TAB";
  payload: Tabs;
};

type SetDevToolsHeight = {
  type: "SET_HEIGHT";
  payload: number;
};

type SetRouteWildcards = {
  type: "SET_ROUTE_WILDCARDS";
  payload: RouteWildcards;
};

type PurgeTimeline = {
  type: "PURGE_TIMELINE";
  payload: undefined;
};

type SetIsSubmittedAction = {
  type: "SET_IS_SUBMITTED";
  payload: any;
};

type SetShouldConnectToForgeAction = {
  type: "SET_SHOULD_CONNECT_TO_FORGE";
  payload: boolean;
};

/** Aggregate of all action types */
export type RemixDevToolsActions =
  | SetTimelineEvent
  | SetActiveTab
  | PurgeTimeline
  | SetRouteWildcards
  | SetDevToolsHeight
  | SetShouldConnectToForgeAction
  | SetIsSubmittedAction;

export const rdtReducer = (
  state: RemixDevToolsState = initialState,
  { type, payload }: RemixDevToolsActions
): RemixDevToolsState => {
  switch (type) {
    case "SET_TIMELINE_EVENT":
      return {
        ...state,
        timeline: [payload, ...state.timeline],
      };
    case "SET_ACTIVE_TAB":
      return {
        ...state,
        settings: {
          ...state.settings,
          activeTab: payload,
        },
      };
    case "PURGE_TIMELINE":
      return {
        ...state,
        timeline: [],
      };
    case "SET_IS_SUBMITTED":
      return {
        ...state,
        ...payload,
        isSubmitted: true,
      };
    case "SET_ROUTE_WILDCARDS":
      return {
        ...state,
        settings: {
          ...state.settings,
          routeWildcards: payload,
        },
      };
    case "SET_HEIGHT":
      return {
        ...state,
        settings: {
          ...state.settings,
          height: payload,
        },
      };

    case "SET_SHOULD_CONNECT_TO_FORGE":
      return {
        ...state,
        settings: {
          ...state.settings,
          shouldConnectWithForge: payload,
        },
      };
    default:
      return state;
  }
};
