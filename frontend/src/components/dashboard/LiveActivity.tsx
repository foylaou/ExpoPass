import React from 'react';
import { Clock, MapPin, User, ScanLine } from 'lucide-react';

interface ActivityRecord {
    id: string;
    attendee_name: string;
    attendee_company: string;
    booth_name: string;
    booth_number: string;
    scanned_at: string;
    time_ago: string;
}

interface LiveActivityProps {
    recentScans: ActivityRecord[];
    isLoading?: boolean;
}

export const LiveActivity: React.FC<LiveActivityProps> = ({
                                                              recentScans,
                                                              isLoading = false
                                                          }) => {
    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('zh-TW', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">即時活動</h3>
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                </div>
                                <div className="h-3 bg-gray-200 rounded w-16"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">即時活動</h3>
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-600">即時更新</span>
                </div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
                {recentScans.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <ScanLine className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>暫時無掃描記錄</p>
                    </div>
                ) : (
                    recentScans.map((scan, index) => (
                        <div
                            key={`${scan.id}-${scan.scanned_at}-${index}`}
                            className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            {/* Avatar */}
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="w-5 h-5 text-blue-600" />
                            </div>

                            {/* Activity */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {scan.attendee_name}
                                    {scan.attendee_company && (
                                        <span className="text-gray-500"> ({scan.attendee_company})</span>
                                    )}
                                </p>
                                <div className="flex items-center space-x-4 mt-1">
                                    <div className="flex items-center space-x-1 text-gray-500 text-xs">
                                        <MapPin className="w-3 h-3" />
                                        <span>{scan.booth_name} ({scan.booth_number})</span>
                                    </div>
                                    <span className="text-xs text-gray-400">
                    {scan.time_ago}
                  </span>
                                </div>
                            </div>

                            {/* Time */}
                            <div className="flex items-center space-x-1 text-gray-400 text-xs flex-shrink-0">
                                <Clock className="w-3 h-3" />
                                <span>{formatTime(scan.scanned_at)}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {recentScans.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center">
                        顯示最近 {recentScans.length} 筆掃描記錄
                    </p>
                </div>
            )}
        </div>
    );
};
