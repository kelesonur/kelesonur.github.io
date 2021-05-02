---
permalink: /
title: "About me"
excerpt: "About me"
author_profile: true
redirect_from: 
  - /about/
  - /about.html
---

Hi there, welcome to my personal website! My name is Onur Kele&#351 [o&#712;nur&#805; ke&#712;le&#643;]. I am a senior in the [Department of Foreign Language Education](https://fled.boun.edu.tr) at [Bogaziçi University](http://www.boun.edu.tr), Istanbul, Turkey. My main research interests include sign language linguistics, (atypical) language development, sentential processing, and computational linguistics.

Research
======
I am currently affiliated with the [Psycholinguistics Research Laboratory](http://denizlab.boun.edu.tr) led by Dr. Nazik Deniz Dinçtopal. In the lab, I am working on a project that examines how individuals on the autism spectrum process sentences and integrate real world knowledge. I am also volunteering for another project that investigates the processing of negative polarity items (NPIs) in Turkish. Previously I worked as undergraduate research assistant in the [Sign Language Lab](https://linguistics.boun.edu.tr/sign-language-lab) located at the [Department of Linguistics](https://linguistics.boun.edu.tr). Under the supervision of Dr. Kadir Gökgöz, I led two research projects where I explored the cognitive and linguistic effects of linguistic deprivation on the narrative abilities and verbal fluency of deaf individuals who use [Turkish Sign Language](https://en.wikipedia.org/wiki/Turkish_Sign_Language). My other academic interests cover cognitive modeling and computational analyses of natural languages. 

Teaching
======
Professionally, I have been teaching English as a foreign language to both university-level and K12 learners in different institutions. I am currently a student teacher at [Robert College](https://www.robcol.k12.tr) where I plan and teach lessons to 9th grade students. I am also one of the co-founders of the educational platform [FluentKid](fluentkid.com). My teaching philosophy include the integration of Computer Assisted Language Learning (CALL) and Task Based Language Teaching (TBLT). Please view my educational portfolio [page](https://kelesonur.com/portfolio/) to see sample lesson plans and materials. On this [page](https://kelesonur.com/year-archive/), I share my personal reflections concerning meaningful learning and technology incorporated classrooms.

Getting started
======
1. Register a GitHub account if you don't have one and confirm your e-mail (required!)
1. Fork [this repository](https://github.com/academicpages/academicpages.github.io) by clicking the "fork" button in the top right. 
1. Go to the repository's settings (rightmost item in the tabs that start with "Code", should be below "Unwatch"). Rename the repository "[your GitHub username].github.io", which will also be your website's URL.
1. Set site-wide configuration and create content & metadata (see below -- also see [this set of diffs](http://archive.is/3TPas) showing what files were changed to set up [an example site](https://getorg-testacct.github.io) for a user with the username "getorg-testacct")
1. Upload any files (like PDFs, .zip files, etc.) to the files/ directory. They will appear at https://[your GitHub username].github.io/files/example.pdf.  
1. Check status by going to the repository settings, in the "GitHub pages" section

Site-wide configuration
------
The main configuration file for the site is in the base directory in [_config.yml](https://github.com/academicpages/academicpages.github.io/blob/master/_config.yml), which defines the content in the sidebars and other site-wide features. You will need to replace the default variables with ones about yourself and your site's github repository. The configuration file for the top menu is in [_data/navigation.yml](https://github.com/academicpages/academicpages.github.io/blob/master/_data/navigation.yml). For example, if you don't have a portfolio or blog posts, you can remove those items from that navigation.yml file to remove them from the header. 

Create content & metadata
------
For site content, there is one markdown file for each type of content, which are stored in directories like _publications, _talks, _posts, _teaching, or _pages. For example, each talk is a markdown file in the [_talks directory](https://github.com/academicpages/academicpages.github.io/tree/master/_talks). At the top of each markdown file is structured data in YAML about the talk, which the theme will parse to do lots of cool stuff. The same structured data about a talk is used to generate the list of talks on the [Talks page](https://academicpages.github.io/talks), each [individual page](https://academicpages.github.io/talks/2012-03-01-talk-1) for specific talks, the talks section for the [CV page](https://academicpages.github.io/cv), and the [map of places you've given a talk](https://academicpages.github.io/talkmap.html) (if you run this [python file](https://github.com/academicpages/academicpages.github.io/blob/master/talkmap.py) or [Jupyter notebook](https://github.com/academicpages/academicpages.github.io/blob/master/talkmap.ipynb), which creates the HTML for the map based on the contents of the _talks directory).

**Markdown generator**

I have also created [a set of Jupyter notebooks](https://github.com/academicpages/academicpages.github.io/tree/master/markdown_generator
) that converts a CSV containing structured data about talks or presentations into individual markdown files that will be properly formatted for the academicpages template. The sample CSVs in that directory are the ones I used to create my own personal website at stuartgeiger.com. My usual workflow is that I keep a spreadsheet of my publications and talks, then run the code in these notebooks to generate the markdown files, then commit and push them to the GitHub repository.

How to edit your site's GitHub repository
------
Many people use a git client to create files on their local computer and then push them to GitHub's servers. If you are not familiar with git, you can directly edit these configuration and markdown files directly in the github.com interface. Navigate to a file (like [this one](https://github.com/academicpages/academicpages.github.io/blob/master/_talks/2012-03-01-talk-1.md) and click the pencil icon in the top right of the content preview (to the right of the "Raw | Blame | History" buttons). You can delete a file by clicking the trashcan icon to the right of the pencil icon. You can also create new files or upload files by navigating to a directory and clicking the "Create new file" or "Upload files" buttons. 

Example: editing a markdown file for a talk
![Editing a markdown file for a talk](/images/editing-talk.png)

For more info
------
More info about configuring academicpages can be found in [the guide](https://academicpages.github.io/markdown/). The [guides for the Minimal Mistakes theme](https://mmistakes.github.io/minimal-mistakes/docs/configuration/) (which this theme was forked from) might also be helpful.
