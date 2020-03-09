import React, { useState, useMemo, useEffect } from 'react';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import {
    format,
    subDays,
    addDays,
    setHours,
    setMinutes,
    setSeconds,
    isBefore,
    isEqual,
    parseISO,
    setMilliseconds
} from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import pt from 'date-fns/locale/pt';

import api from '../../services/api';

import { Container, Time } from './styles';

export default function Dashboard() {
    const [date, setDate] = useState(new Date());
    const [schedule, setSchedule] = useState([]);

    const range = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

    useEffect(() => {
        async function loadSchedule() {
            const response = await api.get('/schedule', {
                params: {
                    date
                }
            });

            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

            const data = range.map(hour => {
                const checkDate = setMilliseconds(
                    setSeconds(setMinutes(setHours(date, hour), 0), 0),
                    0
                );

                const compareDate = utcToZonedTime(checkDate, timezone);

                return {
                    time: `${hour}:00`,
                    past: isBefore(compareDate, new Date()),
                    appointment: response.find(a => {
                        return isEqual(parseISO(a.date), compareDate);
                    })
                };
            });
            setSchedule(data);
        }

        loadSchedule();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [date]);

    const dateFormatted = useMemo(
        () => format(date, "d 'de' MMMM", { locale: pt }),
        [date]
    );

    function handlePrevDay() {
        setDate(subDays(date, 1));
    }

    function handleNextDay() {
        setDate(addDays(date, 1));
    }
    return (
        <Container>
            <header>
                <button type="button" onClick={handlePrevDay}>
                    <MdChevronLeft size={40} color="#FFF" />
                </button>
                <strong>{dateFormatted}</strong>
                <button type="button" onClick={handleNextDay}>
                    <MdChevronRight size={40} color="#FFF" />
                </button>
            </header>

            <ul>
                {schedule.map(time => (
                    <Time
                        key={time.time}
                        past={time.past}
                        available={!time.appointment}
                    >
                        <time>{time.time}</time>
                        <span>
                            {time.appointment
                                ? time.appointment.user.name
                                : 'Em Aberto'}
                        </span>
                    </Time>
                ))}
            </ul>
        </Container>
    );
}
