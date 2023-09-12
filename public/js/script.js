const ORIGIN = 'http://192.168.100.71:3000'
let GROUPS_DATA;

const curDate = new Date().toISOString().split('T')[0]

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
			GROUPS_DATA = json.data
			const writePage = document.querySelector('.write')
			const historyPage = document.querySelector('.history')

			GROUPS_DATA.forEach(group => {
				const omissions = group.records.length ? group.records.slice(-1)[0].absent : 0
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

				const historyBox = historyPage.querySelector(`.groups__course[data-course="${course}"]`)
				const curatorParts = group.teacher.split(' ')
				const curatorName = `${curatorParts[0]} ${curatorParts[1][0]} ${curatorParts[2][0]}`;

				const recordsCount = group.records.length
				let additRows = ''
				for (let i = 1; i < recordsCount; i++) {
					additRows += `
					<tr>
						<td>${group.records[1]?.time.slice(0, -3) ?? '-'}</td>
						<td>${group.records[1]?.absent ?? '-'}</td>
					</tr>
					`
				}
				historyBox.insertAdjacentHTML('beforeend', `
				<tr>
					<td rowspan="${Math.max(recordsCount, 1)}" style="text-align: left;">
						<span class="group">${group.id_group}</span> <br>
						<span class="curator">${curatorName}</span>
					</td>
					<td rowspan="${Math.max(recordsCount, 1) }">${group.participants}</td>
					<td>${group.records[0]?.time.slice(0, -3) ?? '-'}</td>
					<td>${group.records[0]?.absent ?? '-'}</td>
				</tr>
				${additRows}
				`)
			});
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
			const groupData = GROUPS_DATA.filter(g => g.id_group === group)[0]
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
		target.closest('.calendar').querySelector('td.cur').classList.remove('cur')
		target.classList.add('cur')
	} else if (target.classList.contains('write-group__save-btn')) {

		const section = target.closest('section')
		const groupId = [...section.querySelector('.breadcrumbs').children].slice(-1)[0].textContent
		const absentCount = section.querySelector('.write-group__count .cur input').value

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
	const list = dropdown.querySelector('.select-with-image__list')
	const buttons = list.querySelectorAll('.select-with-image__btn')

	ddSelect.querySelector('.select-with-image__btn')?.remove()
	ddSelect.append(buttons[0]?.cloneNode(true) || '')

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
			ddSelect.querySelector('.select-with-image__btn')?.remove()
			ddSelect.append(btn.cloneNode(true))
		})
	})
})


//calendar
const calendarBtn = document.querySelector('.history__calendar-btn')
const calendar = document.querySelector('.calendar')
calendarBtn.addEventListener('click', function () {
	calendar.classList.add('active')
	document.body.style.overflow = 'hidden'
})
calendar.addEventListener('click', function (evt) {
	if (evt.target === calendar) {
		calendar.classList.remove('active')
		document.body.style.overflow = null
	}
})


function toPage(targetPage) {
	document.querySelector('section.active').classList.remove('active')
	document.querySelector(`[data-page="${targetPage}"]`).classList.add('active')
}

