import type { Feature } from '@/types';

export function getPromotedFeatures(): Feature[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('vibeflow-promoted-features');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function savePromotedFeatures(features: Feature[]): void {
  localStorage.setItem('vibeflow-promoted-features', JSON.stringify(features));
}

export function addPromotedFeature(feature: Feature): void {
  const existing = getPromotedFeatures();
  const updated = [feature, ...existing.filter((f) => f.id !== feature.id)];
  savePromotedFeatures(updated);
}

export function updateFeatureStatus(featureId: string, newStatus: string): void {
  const features = getPromotedFeatures();
  const updated = features.map((f) =>
    f.id === featureId ? { ...f, status: newStatus as Feature['status'] } : f
  );
  savePromotedFeatures(updated);
}
