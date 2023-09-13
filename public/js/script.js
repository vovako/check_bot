

//on load
const ORIGIN = 'http://192.168.100.71:3000'
let CUR_GROUPS_DATA;
const curDate = new Date().toISOString().split('T')[0]
const calendarDateParts = [curDate.substring(0, 4), curDate.substring(5, 7), curDate.substring(8, 10)]//year, month, day

//calendar
const calendar = document.querySelector('.calendar')
const calendarBtn = document.querySelector('.history__calendar-btn')
const calendarApplyBtn = calendar.querySelector('.calendar__apply-btn')

const curYear = calendarDateParts[0]
const curMonth = calendarDateParts[1]
const curDay = calendarDateParts[2]

const yearSelect = calendar.querySelector('.calendar-year')
const monthSelect = calendar.querySelector('.calendar-month')

updateLongDate(curDate)
updateCalendar(curDate)
const yearOption = [...yearSelect.querySelector(`.select-with-image__list`).children].filter(y => y.textContent === curYear)[0]
yearSelect.querySelector('.select-with-image__content').appendChild(yearOption.cloneNode(true));

const monthOption = monthSelect.querySelector(`.select-with-image__list [data-month="${curMonth}"]`)
monthSelect.querySelector('.select-with-image__content').appendChild(monthOption.cloneNode(true));

// [...calendar.querySelectorAll('.calendar__body tbody td')].filter(d => !d.classList.contains('extra') && d.textContent === curDay)[0].className = 'cur active';

calendarBtn.addEventListener('click', function () {
	calendar.classList.add('active')
	document.body.style.overflow = 'hidden'
})
calendar.addEventListener('click', function (evt) {
	if (evt.target === calendar) {
		closeCalendar()
	}
})
calendarApplyBtn.addEventListener('click', function () {

	const selectedDate = `${calendarDateParts[0]}-${calendarDateParts[1]}-${calendarDateParts[2]}`
	updateLongDate(selectedDate)

	fetch(`${ORIGIN}/api/groups/getgroups`, {
		method: 'post',
		body: JSON.stringify({
			"date": selectedDate
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	}).then(res => res.json())
		.then(json => {

			if (json.code === 200) {
				updateHistoryTable(json.data)
			}
		})
		.catch(err => console.log(err))

	closeCalendar()
})

function updateLongDate(date) {
	const labelBtn = new Date(date).toLocaleDateString('ru', { year: 'numeric', month: 'long', day: 'numeric' }).slice(0, -3)
	calendarBtn.textContent = labelBtn
}
function closeCalendar() {
	calendar.classList.remove('active')
	document.body.style.overflow = null
}
function updateCalendar(date) {
	const curYear = date.substring(0, 4)
	const curMonth = date.substring(5, 7)
	const curDay = curDate.substring(8, 10)

	const calendarBox = document.querySelector('.calendar table tbody')
	calendarBox.innerHTML = ''

	const daysCount = new Date(curYear, curMonth, 0).getDate()
	const prevMonthDaysCount = new Date(curYear, curMonth - 1, 0).getDate()
	const prevMonthVisibleDaysCount = new Date(curYear, curMonth - 1, 0).getDay()
	let nextMonthVisibleDaysCount = new Date(curYear, curMonth, 1).getDay() - 1
	nextMonthVisibleDaysCount = 7 - (nextMonthVisibleDaysCount < 0 ? 6 : nextMonthVisibleDaysCount)
	if (nextMonthVisibleDaysCount === 7) nextMonthVisibleDaysCount = 0


	const daysArray = Array.from({ length: daysCount }, ((v, i) => i + 1))
	daysArray.splice(0, 0, ...Array.from({ length: prevMonthVisibleDaysCount }, (v, i) => prevMonthDaysCount - i).reverse())
	daysArray.push(...Array.from({ length: nextMonthVisibleDaysCount }, (v, i) => i + 1))

	const emptyRow = '<tr></tr>'
	let row = emptyRow
	let isCurMonth = daysArray[0] === 1
	const oneEntriesCount = daysArray.filter(n => n === 1).length

	for (let i = 1; i <= daysArray.length; i++) {
		document.querySelector('.calendar').classList.add('active')

		const classArray = ['extra']

		if (isCurMonth) {
			classArray.pop()
		} else if (daysArray[i] === 1) {
			isCurMonth = true
		}

		if (i === daysArray.lastIndexOf(1) && oneEntriesCount > 1) {
			isCurMonth = false
		}

		if (curDate === date) {
			if (daysArray[i - 1] === +curDay ) {
				classArray.push('cur')
				classArray.push('active')
			}
		} else if (daysArray[i - 1] === 1 && isCurMonth) {
			classArray.push('active')
			calendarDateParts[2] = '01'
		}

		row += `<td ${classArray.length > 0 ? 'class="' + classArray.join(' ') + '"' : ''}>${daysArray[i - 1]}</td>`

		if (i % 7 == 0) {
			calendarBox.insertAdjacentHTML('beforeend', `${row}`)
			row = emptyRow
		}
	}
}

//get groups
fetch(`${ORIGIN}/api/groups/getgroups`, {
	method: 'post',
	body: JSON.stringify({
		"date": curDate
	}),
	headers: {
		'Content-Type': 'application/json'
	}
}).then(res => res.json())
	.then(json => {
		console.log(json);

		if (json.code === 200) {
			CUR_GROUPS_DATA = json.data
			const writePage = document.querySelector('.write')

			CUR_GROUPS_DATA.forEach(group => {
				const omissions = group.records.slice(-1)[0]?.absent ?? 0
				const cameCount = group.participants - +omissions

				const course = group.id_group[0]
				const writeBox = writePage.querySelector(`.groups__course[data-course="${course}"]`)
				writeBox.insertAdjacentHTML('beforeend', `
				<div class="groups-item">
					<div class="groups-item__title">${group.id_group}</div>
					<div class="groups-item__count">
						<span class="cur">${cameCount}</span> /
						<span class="all">${group.participants}</span>
					</div>
				</div>
				`)
			});

			updateHistoryTable(CUR_GROUPS_DATA)
		}
	})
	.catch(err => console.log(err))

document.addEventListener('click', function (evt) {
	const target = evt.target

	if (target.hasAttribute('data-page-target')) {
		const targetPage = target.getAttribute('data-page-target')
		toPage(targetPage)
	} else if (target.classList.contains('groups-item')) {

		const section = target.closest('section')

		if (section.classList.contains('write')) {
			const group = target.querySelector('.groups-item__title').textContent
			const groupCrumb = [...document.querySelector('.write-group .breadcrumbs').children].pop()
			groupCrumb.textContent = group

			const writeGroupConut = document.querySelector('.write-group__count')
			const groupData = CUR_GROUPS_DATA.filter(g => g.id_group === group)[0]
			const cameCount = target.querySelector('.groups-item__count .cur').textContent

			writeGroupConut.outerHTML = `
				<div class="write-group__count"><span class="cur"><input max="${groupData.participants}" min="0" type="number" value="${cameCount}"
					inputmode="numeric" oninput="{
						let value = this.value
						while (Number(value) > Number(this.max)) {
							value = value.slice(0, -1)
						}
						this.value = value
						return false;
						}"
				onfocus="this.select()"
				onfocusout="{
					if (this.value === '') {
						this.value = 0
					}
				}"></span>
				/ <span class="all">${groupData.participants}</span></div>
			`;

			toPage('write-group')

		} else if (section.classList.contains('history')) {

			toPage('history-group')

		}

	} else if (!target.closest('.select-with-image') && document.querySelector('.select-with-image__list.active')) {
		const allSelect = document.querySelectorAll('.select-with-image__list')
		Array.from(allSelect).map(e => e.classList.remove('active'))
	} else if (target.tagName === 'TD' && target.closest('.calendar') && !target.classList.contains('extra')) {
		target.closest('.calendar').querySelector('td.active')?.classList.remove('active')
		target.classList.add('active')

		const selectedDay = document.querySelector('.calendar__body tbody .active').textContent
		calendarDateParts[2] = selectedDay.length === 1 ? '0' + selectedDay : selectedDay

	} else if (target.classList.contains('select-with-image__btn') && target.closest('.calendar-month .select-with-image__list')) {
		calendarDateParts[1] = monthSelect.querySelector('.select-with-image__field .select-with-image__btn').dataset.month
		updateCalendar(calendarDateParts.join('-'))
	} else if (target.classList.contains('select-with-image__btn') && target.closest('.calendar-year .select-with-image__list')) {
		calendarDateParts[0] = yearSelect.querySelector('.select-with-image__field .select-with-image__btn').textContent
		updateCalendar(calendarDateParts.join('-'))
	}
})

//tabs
const allTabs = document.querySelectorAll('.groups-tabs')
allTabs.forEach(tabs => {
	const tabsBtn = tabs.querySelectorAll('.groups-tabs__btn')
	const courses = tabs.closest('section').querySelectorAll('.groups__course')

	tabsBtn.forEach(btn => {
		btn.addEventListener('click', function () {
			[...tabsBtn].map(btn => btn.classList.remove('active'))
			btn.classList.add('active')

			const courseTarget = btn.dataset.courseTarget;
			[...courses].map(c => c.classList.remove('active'))
			if (courseTarget == 'all') {
				[...courses].map(c => c.classList.add('active'))
			} else {
				[...courses].filter(c => c.getAttribute('data-course') === courseTarget)[0].classList.add('active')
			}
		})
	})
})

//dropdown
document.querySelectorAll('.select-with-image').forEach(dropdown => {
	const ddSelect = dropdown.querySelector('.select-with-image__field')
	const ddContent = ddSelect.querySelector('.select-with-image__content')
	const list = dropdown.querySelector('.select-with-image__list')
	const buttons = list.querySelectorAll('.select-with-image__btn')

	// ddSelect.querySelector('.select-with-image__btn')?.remove()
	ddContent.firstChild ? '' : ddContent.append(buttons[0]?.cloneNode(true) || '')


	ddSelect.addEventListener('click', function () {
		list.classList.toggle('active')
		const allActive = document.querySelectorAll('.select-with-image__list.active')
		for (const active of allActive) {
			if (active != list) {
				active.classList.remove('active')
			}
			if (list.getBoundingClientRect().bottom + 20 > window.innerHeight) {
				const offset = window.innerHeight - list.getBoundingClientRect().top - 20
				list.style.height = offset + 'px'
			}
		}
	})
	buttons.forEach(btn => {
		btn.addEventListener('click', function () {
			list.classList.remove('active')
			ddContent.innerHTML = ''
			ddContent.append(btn.cloneNode(true))
		})
	})
})

//apply-btn
const writeApplyBtn = document.querySelector('.write-group__save-btn')
writeApplyBtn.addEventListener('click', function () {

	const section = writeApplyBtn.closest('section')
	const groupId = [...section.querySelector('.breadcrumbs').children].slice(-1)[0].textContent
	const cameCount = +section.querySelector('.write-group__count .cur input').value
	const allStudentsCount = +section.querySelector('.write-group__count .all').textContent
	const absentCount = allStudentsCount - cameCount

	fetch(`${ORIGIN}/api/record/addrecord`, {
		method: 'post',
		body: JSON.stringify({
			"id_duty": 12,
			"id_group": groupId,
			"absent": absentCount
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	})
		.then(res => res.json())
		.then(json => {
			console.log(json)
			toPage('write')
		})
		.catch(err => console.log(err))

})

//change-btn


function toPage(targetPage) {
	document.querySelector('section.active').classList.remove('active')
	document.querySelector(`[data-page="${targetPage}"]`).classList.add('active')
}

function updateHistoryTable(data) {
	const historyPage = document.querySelector('.history')

	const allCourses = historyPage.querySelectorAll('.groups__course')
	allCourses.forEach(course => {
		course.innerHTML = ''
	})

	data.forEach(group => {
		const course = group.id_group[0]
		const historyBox = historyPage.querySelector(`.groups__course[data-course="${course}"]`)

		const curatorParts = group.teacher.split(' ')
		const curatorName = `${curatorParts[0]} ${curatorParts[1][0]} ${curatorParts[2][0]}`;

		const recordsCount = group.records.length
		let additRows = ''
		for (let i = 1; i < recordsCount; i++) {
			additRows += `
				<tr>
					<td>${group.records[i]?.time.slice(0, -3) ?? '-'}</td>
					<td>${group.records[i]?.absent ?? '-'}</td>
				</tr>
				`
		}
		historyBox.insertAdjacentHTML('beforeend', `
			<tr>
				<td rowspan="${Math.max(recordsCount, 1)}" style="text-align: left;">
					<span class="group">${group.id_group}</span> <br>
					<span class="curator">${curatorName}</span>
				</td>
				<td rowspan="${Math.max(recordsCount, 1)}">${group.participants}</td>
				<td>${group.records[0]?.time.slice(0, -3) ?? '-'}</td>
				<td>${group.records[0]?.absent ?? '-'}</td>
			</tr>
			${additRows}
			`)
	})
}

