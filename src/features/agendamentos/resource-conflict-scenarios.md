# Cenários de conflito de recursos

Regra: existe conflito quando `existing.startDateTime < newEndDateTime` e `existing.endDateTime > newStartDateTime`.

- Existente 09:30-10:20, novo 09:15-09:45: conflito.
- Existente 09:30-10:20, novo 10:00-10:30: conflito.
- Existente 09:30-10:20, novo 09:30-10:20: conflito.
- Existente 09:30-10:20, novo 09:00-11:00: conflito.
- Existente 09:30-10:20, novo 09:00-09:30: sem conflito.
- Existente 09:30-10:20, novo 10:20-11:00: sem conflito.
- Agendamento cancelado no mesmo horário: sem conflito.
- Agendamento no_show no mesmo horário: sem conflito.
- Agendamento soft deleted no mesmo horário: sem conflito.
- Editar o próprio agendamento mantendo sala e horário: sem conflito consigo mesmo.
