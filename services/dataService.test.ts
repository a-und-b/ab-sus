
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dataService } from './dataService';

const mocks = vi.hoisted(() => {
    const mockSingle = vi.fn();
    const mockEq = vi.fn(() => ({ single: mockSingle }));
    const mockSelect = vi.fn(() => ({ eq: mockEq }));
    const mockUpsertSelect = vi.fn(() => ({ single: mockSingle }));
    const mockUpsert = vi.fn(() => ({ select: mockUpsertSelect }));
    const mockFrom = vi.fn(() => ({
        select: mockSelect,
        upsert: mockUpsert
    }));
    
    return {
        mockSingle,
        mockEq,
        mockSelect,
        mockUpsertSelect,
        mockUpsert,
        mockFrom
    }
});

vi.mock('./supabase', () => ({
    supabase: {
        from: mocks.mockFrom,
        functions: { invoke: vi.fn() }
    }
}));

describe('DataService Config Update', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should correctly include location in update', async () => {
        // 1. Mock getConfig response (current state)
        mocks.mockSingle.mockResolvedValueOnce({
            data: {
                id: 1,
                title: 'Test Event',
                location: 'Old Location',
                max_guests: 10,
                allow_plus_one: false,
                secret_santa_limit: 10,
                dietary_options: [],
            },
            error: null
        });

        // 2. Mock upsert response (updated state)
        mocks.mockSingle.mockResolvedValueOnce({
            data: {
                id: 1,
                title: 'Test Event',
                location: 'New Location',
                max_guests: 10
            },
            error: null
        });

        await dataService.updateConfig({ location: 'New Location' });

        // Verify that upsert was called
        expect(mocks.mockUpsert).toHaveBeenCalledTimes(1);
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const calls = mocks.mockUpsert.mock.calls as any[];
        if (calls.length > 0) {
            const upsertArg = calls[0][0] as { location: string; id: number };
            console.log('Upsert Argument:', upsertArg);
            
            expect(upsertArg.location).toBe('New Location');
            expect(upsertArg.id).toBe(1);
        } else {
            throw new Error('upsert was not called');
        }
    });
});
