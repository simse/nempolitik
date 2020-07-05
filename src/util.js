export const getPoliticianExperienceOfType = (politician, type) => {
    let experiences = []

    if (!politician.experience) {
        return experiences
    }

    politician.experience.forEach(experience => {
        if (experience.type === type) {
            experiences.push(experience)
        }
    })

    return experiences.reverse()
}