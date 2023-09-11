// import WebApp from '@grammyjs/web-app';
// WebApp.ready();

document.addEventListener('click', function (evt) {
	const target = evt.target

	if (target.hasAttribute('data-page-target')) {
		const targetPage = target.getAttribute('data-page-target')
		toPage(targetPage)
	} else if (target.classList.contains('groups-item')) {
		const section = target.closest('section')
		if (section.classList.contains('write')) {
			toPage('write-group')
		} else if (section.classList.contains('history')) {
			toPage('history-group')
		}
	} else if (!target.closest('.select-with-image') && document.querySelector('.select-with-image__list.active')) {
		const allSelect = document.querySelectorAll('.select-with-image__list')
		Array.from(allSelect).map(e => e.classList.remove('active'))
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

