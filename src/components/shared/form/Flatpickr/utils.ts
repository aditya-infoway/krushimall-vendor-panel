import { Instance } from "flatpickr/dist/types/instance";
import { DateOption, Options } from "flatpickr/dist/types/options";
import invariant from "tiny-invariant";
import { FlatpickrProps, HookName, hooks } from "./types";

export const getFlatpickrOptions = (props: FlatpickrProps) => {
  const flatpickrOptions = { ...props.options };
  
  const closeHandler = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  hooks.forEach((hook) => {
    const hookValue = props[hook as keyof FlatpickrProps];
    if (hookValue) {
      if (!flatpickrOptions[hook]) {
        flatpickrOptions[hook] = [];
      } else if (!Array.isArray(flatpickrOptions[hook])) {
        flatpickrOptions[hook] = [flatpickrOptions[hook]];
      }

      const propHook = Array.isArray(hookValue) ? hookValue : [hookValue];
      flatpickrOptions[hook] = [...flatpickrOptions[hook], ...propHook];
    }
  });

  if (!flatpickrOptions.onClose) {
    flatpickrOptions.onClose = [closeHandler];
  } else if (Array.isArray(flatpickrOptions.onClose)) {
    flatpickrOptions.onClose.push(closeHandler);
  } else {
    flatpickrOptions.onClose = [flatpickrOptions.onClose, closeHandler];
  }

  return flatpickrOptions;
};

export const formatDateValue = (
  instance: Instance,
  val: DateOption | DateOption[],
) => {
  const dateFormat = instance.config.dateFormat;

  const formatSingle = (date: DateOption): DateOption => {
    if (date instanceof Date) {
      return instance.formatDate(date, dateFormat);
    }

    if (typeof date === "string" && date !== "") {
      // Agar string already flatpickr ke dateFormat ke mutabik nahi hai
      // (e.g. "2026-06-20" ya ISO "2026-06-20T00:00:00.000Z"),
      // to pehle native Date mein parse karo, phir sahi format mein convert karo.
      const parsed = new Date(date);
      if (!isNaN(parsed.getTime())) {
        return instance.formatDate(parsed, dateFormat);
      }
    }

    return date;
  };

  if (Array.isArray(val)) {
    return val.map(formatSingle);
  }

  return formatSingle(val);
};

export const formatAndSetValue = (
  instance: Instance,
  val: DateOption | DateOption[] | "",
) => {
  invariant(instance, "Flatpickr instance not found");

  if (val === "") {
    instance.clear();
    return;
  }

  const formattedValue = formatDateValue(instance, val);

  instance.setDate(formattedValue, false);
};

export const updateFlatpickrOptions = (
  instance: Instance,
  flatpickrOptions: Record<string, any>,
) => {
  invariant(instance, "Flatpickr instance not found during options update");

  Object.keys(flatpickrOptions).forEach((key) => {
    if (hooks.includes(key as HookName)) {
      let optionValue = flatpickrOptions[key];
      if (!Array.isArray(optionValue)) {
        optionValue = [optionValue];
      }
      instance.set(key as keyof Options, optionValue);
    } else {
      instance.set(key as keyof Options, flatpickrOptions[key]);
    }
  });
};
