import React from 'react';
import styles from '../styles/WeatherWidget.module.css';

interface TaskData {
    id: string;
    title: string;
    priority: 'urgent' | 'high' | 'medium' | 'low';
    status: 'pending' | 'completed';
    dueTime?: string;
    icon: string;
}

interface AlertData {
    id: string;
    type: 'critical' | 'warning' | 'advisory' | 'info';
    message: string;
    icon: string;
}

interface TasksAlertsProps {
    tasks?: TaskData[];
    alerts?: AlertData[];
}

const TasksAlerts: React.FC<TasksAlertsProps> = ({ tasks = [], alerts = [] }) => {
    // Use sample data if none is provided
    const defaultTasks: TaskData[] = [
        { id: '1', title: 'Irrigate wheat field', priority: 'urgent', status: 'pending', dueTime: 'Due now', icon: '💧' },
        { id: '2', title: 'Check for pest signs', priority: 'high', status: 'pending', icon: '🐛' },
        { id: '3', title: 'Apply nitrogen fertilizer', priority: 'high', status: 'pending', dueTime: 'Tomorrow', icon: '🌱' },
        { id: '4', title: 'Soil testing', priority: 'medium', status: 'completed', icon: '🧪' }
    ];

    const defaultAlerts: AlertData[] = [
        { id: '1', type: 'warning', message: 'Heavy rain expected in 3 days', icon: '🌧️' },
        { id: '2', type: 'advisory', message: 'Fertilizer application due tomorrow', icon: '🌱' },
        { id: '3', type: 'critical', message: 'Pest outbreak detected in nearby farms', icon: '🐞' },
        { id: '4', type: 'info', message: 'Market prices for wheat have increased by 5%', icon: '📈' }
    ];

    // Use provided data or default to sample data if empty
    const tasksToShow = tasks.length > 0 ? tasks : defaultTasks;
    const alertsToShow = alerts.length > 0 ? alerts : defaultAlerts;

    return (
        <div className={styles.tasksAlertsContainer}>
            <div className={styles.sectionContainer}>
                <div className={styles.sectionHeader}>
                    <h3 className="text-lg font-semibold">Priority Tasks</h3>
                    <button className="text-sm text-blue-600">View All</button>
                </div>

                <div className={styles.tasksList}>
                    {tasksToShow.filter(task => task.status === 'pending').slice(0, 3).map(task => (
                        <div key={task.id} className={styles.taskItem}>
                            <div className={styles.taskIcon}>{task.icon}</div>
                            <div className={styles.taskContent}>
                                <div className={styles.taskTitle}>{task.title}</div>
                                {task.dueTime && <div className={styles.taskDueTime}>{task.dueTime}</div>}
                            </div>
                            <div className={`${styles.taskPriority} ${
                                task.priority === 'urgent' ? styles.priorityUrgent : 
                                task.priority === 'high' ? styles.priorityHigh : 
                                task.priority === 'medium' ? styles.priorityMedium : 
                                styles.priorityLow
                            }`}>{task.priority}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.sectionContainer}>
                <div className={styles.sectionHeader}>
                    <h3 className="text-lg font-semibold">Alerts & Advisories</h3>
                    <button className="text-sm text-blue-600">View All</button>
                </div>

                <div className={styles.alertsList}>
                    {alertsToShow.slice(0, 2).map(alert => (
                        <div key={alert.id} className={styles.alertItem}>
                            <div className={`${styles.alertIcon} ${
                                alert.type === 'critical' ? styles.alertCritical : 
                                alert.type === 'warning' ? styles.alertWarning : 
                                alert.type === 'advisory' ? styles.alertAdvisory : 
                                styles.alertInfo
                            }`}>{alert.icon}</div>
                            <div className={styles.alertContent}>
                                <div className={styles.alertMessage}>{alert.message}</div>
                                <div className={styles.alertType}>{alert.type}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TasksAlerts;