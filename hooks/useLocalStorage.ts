import { ref, watchEffect } from 'vue';

export default function useLocalStorage<T>(key: string, fallback: T) {
  const initial = localStorage.getItem(key);

  const data = ref(fallback);

  if (initial != null) {
    data.value = JSON.parse(initial);
  }

  watchEffect(() => {
    localStorage.setItem(key, JSON.stringify(data.value));
  });

  return data;
}
