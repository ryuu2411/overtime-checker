import React, { useCallback, useEffect, useMemo, useState } from "react";

export const OverTimeChecker: React.VFC = () => {
    const operationsList = [
        { value: 1, label: '東京', hour: 10 },
        { value: 2, label: '佐賀', hour: 9 },
        { value: 3, label: '福岡', hour: 10 },
    ];
    // 稼働時間
    const [startTime, setStartTime] = useState('10:00');
    const [startHour, setStartHour] = useState(10);
    const [startMin, setStartMin] = useState(0);
    const [isClick, setIsClick] = useState(false);
    const [selectOperation, setSelectOperation] = useState(1);
    // const displayOperationData = useMemo(() => {
    //     return operationsList.find((v) => v.value === selectOperation);
    // }, [selectOperation]);
    const [overTime, setOverTime] = useState('');
    const [totalOverTime, setTotalOverTime] = useState('');

    // プルメニュー変更処理
    const handlePullChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const changeValue = Number(e.target.value);
        if (!changeValue) {
            window.alert('選択された値が正しくありません。');
            return
        };
        let startTime2 = '';
        if (changeValue === 2) {
            startTime2 = String('0' + operationsList[changeValue - 1].hour + ':00');
        } else {
            startTime2 = String(operationsList[changeValue - 1].hour + ':00');
        }
        setSelectOperation(changeValue);
        setStartTime(startTime2);
        setStartHour(operationsList[changeValue - 1].hour);
        setStartMin(0);
    }, [selectOperation, startTime, startHour, startMin]);

    // 退勤ボタン押下処理
    const handleLeavingWork = useCallback(() => {
        const data = new Date();
        const hour = data.getHours();
        const min = data.getMinutes();
        let overTimeHour = hour - startHour - 9;
        let overTimeMin = min - startMin;
        const totalMin = Number(localStorage.getItem('totalOverMin'));
        const totalHour = Number(localStorage.getItem('totalOverHour'));
        if (overTimeMin < 0) {
            overTimeMin += 60;
            overTimeHour--;
        }
        if (overTimeHour > 0 &&
            overTimeMin >= 0) {
            setOverTime(String(overTimeHour + '時間' + overTimeMin + '分残業しました'));
        } else if (overTimeHour === 0 &&
            overTimeMin >= 0) {
            setOverTime(String(overTimeMin + '分残業しました'));
        } else {
            window.alert('まだ定時ではありません。');
            return;
        }
        localStorage.setItem('totalOverMin', String(totalMin + overTimeMin));
        localStorage.setItem('totalOverHour', String(totalHour + overTimeHour));
        localStorage.setItem('todayOverMin', String(overTimeMin));
        localStorage.setItem('todayOverHour', String(overTimeHour));
        setIsClick(true);
    }, [overTime, startHour, startMin]);

    // もう一度退勤ボタンを押したときの処理
    const handleContinue = useCallback(() => {
        const todayTimeHour = Number(localStorage.getItem('todayOverHour'));
        const todayTimeMin = Number(localStorage.getItem('todayOverMin'));
        const totalMin = Number(localStorage.getItem('totalOverMin'));
        const totalHour = Number(localStorage.getItem('totalOverHour'));
        let overTimeHour = totalHour - todayTimeHour;
        let overTimeMin = totalMin - todayTimeMin;
        if (overTimeMin < 0) {
            overTimeMin += 60;
            overTimeHour--;
        }
        if (overTimeHour > 0 &&
            overTimeMin >= 0) {
            localStorage.setItem('totalOverMin', String(overTimeMin));
            localStorage.setItem('totalOverHour', String(overTimeHour));
        } else if (overTimeHour === 0 &&
            overTimeMin >= 0) {
            localStorage.setItem('totalOverMin', String(overTimeMin));
        } else {
            window.alert('まだ定時ではありません。');
            return;
        }
        handleLeavingWork();
    }, [overTime, startHour, startMin]);

    // 出勤時間変更処理
    const handleTimeChange = useCallback((e: { target: { value: any; }; }) => {
        const timeValue = e.target.value;
        let [hour, min]: number[] = timeValue.split(':');
        if (hour < 10) {
            hour = (hour / 10) * 10;
        }
        if (min < 10) {
            min = (min / 10) * 10;
        }
        setStartTime(timeValue);
        setStartHour(hour);
        setStartMin(min);
    }, [startTime, startHour, startMin]);

    useEffect(() => {
        let totalMin = Number(localStorage.getItem('totalOverMin'));
        let totalHour = Number(localStorage.getItem('totalOverHour'));
        let totalHourStr = '00';
        let totalMinStr = '00';
        if (totalMin) {
            if (totalMin >= 60) {
                totalMin -= 60;
                totalHour++;
                localStorage.setItem('totalOverMin', String(totalMin));
                localStorage.setItem('totalOverHour', String(totalHour));
            }
            if (totalMin < 10) {
                totalMinStr = String('0' + totalMin);
            } else {
                totalMinStr = String(totalMin);
            }
        }
        if (totalHour) {
            if (totalHour < 10) {
                totalHourStr = String('0' + totalHour);
            } else {
                totalHourStr = String(totalHour);
            }
        }
        setTotalOverTime(totalHourStr + ':' + totalMinStr);
        // localStorage.clear();
    }, [overTime])

    useEffect(() => {
        document.body.style.backgroundColor = "#000000"
        return () => {
            document.body.style.backgroundColor = "#000000"
        }
    }, []);

    return (
        <div style={{ display: 'flex', padding: '1rem', alignItems: 'center', gap: '4px', flexDirection: 'column', color: '#FFFFFF' }}>
            <h1>残業チェッカー</h1>
            <section>
                <select value={selectOperation} onChange={handlePullChange}>
                    {operationsList.map((operation) => (
                        <option key={`operation_select_${operation.value}`} value={operation.value}>
                            {operation.label}
                        </option>
                    ))}
                </select>
            </section>
            <input type="time" value={startTime} onChange={handleTimeChange}></input>
            <button onClick={isClick ? handleContinue : handleLeavingWork}>退勤</button>
            <h4>{overTime}</h4>
            <h2 style={{ color: Number(localStorage.getItem('totalOverHour')) >= 10 ? '#FF0000' : '#FFFFFF' }}>{'残業時間：' + totalOverTime}</h2>
        </div>
    );
}
