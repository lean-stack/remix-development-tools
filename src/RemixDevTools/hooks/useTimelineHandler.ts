import { useActionData, useFetchers, useNavigation } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { useRDTContext } from "../context/useRDTContext";
import { TimelineEvent } from "../context/timeline";

const convertFormDataToObject = (formData: FormData | undefined) => {
  const data =
    formData && formData.entries
      ? Object.fromEntries(formData.entries())
      : undefined;
  const finalData = data && Object.keys(data).length > 0 ? data : undefined;
  return finalData;
};

const useTimelineHandler = () => {
  const navigation = useNavigation();
  const fetchers = useFetchers();

  const { setTimelineEvent } = useRDTContext();
  const responseData = useActionData();
  useEffect(() => {
    const { state, location, formAction, formData, formMethod, formEncType } =
      navigation;
    if (state === "idle") {
      return;
    }
    const { state: locState, pathname, search, hash } = location;
    const data = convertFormDataToObject(formData);
    // Form submission handler
    if (state === "submitting") {
      return setTimelineEvent({
        type: "FORM_SUBMISSION",
        from: pathname,
        to: formAction,
        method: formMethod,
        data,
        encType: formEncType,
        id: (Math.random() * Date.now()).toString(),
      });
    }
    if (state === "loading") {
      // Form submitted => action is redirecting the user
      if (formAction && formData && formMethod && locState?._isRedirect) {
        return setTimelineEvent({
          type: "ACTION_REDIRECT",
          from: pathname,
          to: formAction,
          method: formMethod,
          data,
          encType: formEncType,
          responseData,
          id: (Math.random() * Date.now()).toString(),
        });
      }
      // Form submitted => action is responding with data
      if (formAction && formData && formMethod) {
        return setTimelineEvent({
          type: "ACTION_RESPONSE",
          from: pathname,
          to: formAction,
          method: formMethod,
          data,
          encType: formEncType,
          responseData,
          id: (Math.random() * Date.now()).toString(),
        });
      }
      // Loader/browser is redirecting the user
      return setTimelineEvent({
        type:
          locState?._isFetchActionRedirect || locState?._isFetchLoaderRedirect
            ? "FETCHER_REDIRECT"
            : "REDIRECT",
        to: pathname,
        search,
        hash,
        method: "GET",

        id: (Math.random() * Date.now()).toString(),
      });
    }
  }, [navigation, responseData, setTimelineEvent]);

  const fetcherEventQueue = useRef<TimelineEvent[]>([]);
  // Fetchers handler
  useEffect(() => {
    if (navigation.state !== "idle") return;
    const activeFetchers = fetchers.filter((f) => f.state !== "idle");
    // Everything is finished => store the events
    if (activeFetchers.length === 0 && fetcherEventQueue.current.length > 0) {
      fetcherEventQueue.current.map(({ position, ...event }: any) =>
        setTimelineEvent({
          ...event,
          responseData:
            // If the fetcher is a GET request, the response data is stored in the fetcher, otherwise it's already set at this point
            event.method === "GET"
              ? fetchers[position]?.data
              : event.responseData,
          id: (Math.random() * Date.now()).toString(),
        })
      );
      fetcherEventQueue.current = [];
      return;
    }

    fetchers.forEach((fetcher, i) => {
      if (fetcher.state === "idle") return;

      const { data, formAction, formData, formEncType, formMethod } = fetcher;

      if (formAction && formMethod) {
        const form = convertFormDataToObject(formData);
        const event = {
          type:
            fetcher.state === "loading" ? "FETCHER_RESPONSE" : "FETCHER_SUBMIT",
          to: formAction,
          method: formMethod,
          data: form,
          encType: formEncType as any,
          responseData: fetcher.state === "submitting" ? undefined : data,
          position: i,
        };
        fetcherEventQueue.current.push(event as any);
      }
    });
  }, [fetchers, navigation.state, setTimelineEvent]);
};

export { useTimelineHandler };
