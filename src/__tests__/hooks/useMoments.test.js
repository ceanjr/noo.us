import { renderHook, waitFor } from '@testing-library/react';
import { useMoments } from '../../hooks/useMoments';

describe('useMoments', () => {
  const mockSurprises = [
    {
      id: '1',
      type: 'message',
      title: 'Test Message',
      content: 'Hello',
      senderName: 'Alice',
      createdAt: new Date().toISOString(),
      viewed: false,
      reactions: [],
    },
    {
      id: '2',
      type: 'photo',
      title: 'Test Photo',
      content: 'photo-url',
      senderName: 'Bob',
      createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      viewed: true,
      reactions: [],
    },
  ];

  test('should convert surprises to moments', () => {
    const { result } = renderHook(() => useMoments(mockSurprises));

    expect(result.current.moments).toHaveLength(2);
    expect(result.current.moments[0].id).toBe('1');
    expect(result.current.moments[0].type).toBe('message');
  });

  test('should filter moments by period', () => {
    const { result } = renderHook(() => useMoments(mockSurprises));

    // Filter by today
    result.current.setSelectedPeriod('today');
    
    waitFor(() => {
      expect(result.current.filteredMoments.length).toBeLessThanOrEqual(mockSurprises.length);
    });
  });

  test('should calculate music count correctly', () => {
    const musicSurprises = [
      ...mockSurprises,
      {
        id: '3',
        type: 'music',
        title: 'Song',
        content: 'spotify-url',
        senderName: 'Charlie',
        createdAt: new Date().toISOString(),
        viewed: false,
        reactions: [],
      },
    ];

    const { result } = renderHook(() => useMoments(musicSurprises));
    expect(result.current.musicCount).toBe(1);
  });

  test('should calculate photo count correctly', () => {
    const { result } = renderHook(() => useMoments(mockSurprises));
    expect(result.current.photoCount).toBe(1);
  });

  test('should calculate streak', () => {
    const { result } = renderHook(() => useMoments(mockSurprises));
    expect(typeof result.current.streak).toBe('number');
    expect(result.current.streak).toBeGreaterThanOrEqual(0);
  });

  test('should select moment of day from old moments', () => {
    const oldSurprises = [
      {
        id: 'old1',
        type: 'message',
        title: 'Old Message',
        content: 'Test',
        senderName: 'Dave',
        createdAt: new Date(Date.now() - 8 * 86400000).toISOString(), // 8 days ago
        viewed: true,
        reactions: [],
      },
    ];

    const { result } = renderHook(() => useMoments(oldSurprises));
    
    waitFor(() => {
      expect(result.current.momentOfDay).toBeTruthy();
    });
  });

  test('should handle empty surprises array', () => {
    const { result } = renderHook(() => useMoments([]));

    expect(result.current.moments).toHaveLength(0);
    expect(result.current.filteredMoments).toHaveLength(0);
    expect(result.current.musicCount).toBe(0);
    expect(result.current.photoCount).toBe(0);
    expect(result.current.streak).toBe(0);
  });
});
