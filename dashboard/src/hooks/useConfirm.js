import { useCallback, useRef, useState } from 'react';

export default function useConfirm() {
  const [state, setState] = useState({ open: false });
  const resolver = useRef(null);

  const confirm = useCallback(
    (options = {}) =>
      new Promise((resolve) => {
        resolver.current = resolve;
        setState({ open: true, ...options });
      }),
    []
  );

  const close = (result) => {
    if (resolver.current) resolver.current(result);
    resolver.current = null;
    setState({ open: false });
  };

  const confirmProps = {
    open: state.open,
    title: state.title,
    message: state.message,
    confirmLabel: state.confirmLabel,
    danger: state.danger !== false,
    onConfirm: () => close(true),
    onCancel: () => close(false)
  };

  return { confirm, confirmProps };
}