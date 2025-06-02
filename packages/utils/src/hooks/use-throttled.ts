import { isFunction, throttle, ThrottleSettings } from "lodash-es";
import {  useEffect, useMemo } from "react";
import { useLatest } from "./use-latest";
import { Fn } from "../types";

/**
 * A custom hook that returns a throttled version of the provided function.
 * @param callback The function to throttle
 * @param delay The throttle delay in milliseconds (default: 500ms)
 * @param deps Dependencies that will cause the throttled function to be recreated when changed
 * @returns A throttled version of the callback function
 */
export function useThrottleCallback<T extends Fn>(
  callback: T,
  delay = 500,
  options?: ThrottleSettings
){
  const callbackFn = useLatest(callback)

  const throttleCallback = useMemo(() => {
    return throttle((...args:Parameters<T>) => {
      if (!isFunction(callbackFn.current) && process.env.MODE === "development") {
        throw new Error("useThrottle callback first value must is function.")
      }
      return callbackFn.current(...args)
    },delay,options)
  }, [delay,options])


  useEffect(() => {

    return () =>{
      throttleCallback.cancel()
    }
  },[throttleCallback])

  return throttleCallback
}
