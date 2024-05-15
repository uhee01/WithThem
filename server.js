const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const app = express();

require('dotenv').config()

const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local')

app.use(express.static(path.join(__dirname, 'with-them/build')));
app.use(express.json());
var cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}))
const getDbConnection = require('./lib/db.js'); // 데이터베이스 연결 설정 

const { S3Client } = require('@aws-sdk/client-s3')
const multer = require('multer')
const multerS3 = require('multer-s3')
const s3 = new S3Client({
  region: 'ap-northeast-2',
  credentials: {
    accessKeyId: process.env.S3_KEY,
    secretAccessKey: process.env.S3_SECRET
  }
})

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'wh-with-them',
    key: function (req, file, cb) {
      cb(null, Date.now().toString())
    }
  })
})

app.use(passport.initialize())
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60 * 60 * 1000 },
}))

app.use(passport.session())

// 데이터베이스에서 사용자를 찾는 함수
async function findUserById(id) {
  const db = await getDbConnection();
  const [rows] = await db.query('SELECT * FROM mbr_account_tb WHERE MBR_ID = ?', [id]);
  if (rows.length > 0) {
    return rows[0];
  } else {
    return null;
  }
}

passport.use(new LocalStrategy({
  usernameField: 'id',
  passwordField: 'password',
},
  async (id, password, done) => {
    try {
      const user = await findUserById(id);
      if (!user) {
        return done(null, false, { message: 'ID가 존재하지 않습니다.' });
      }

      const isValid = await bcrypt.compare(password, user.MBR_PWD); // 비교 함수를 비동기로 변경
      if (!isValid) {
        return done(null, false, { message: '비밀번호가 틀렸습니다.' });
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));


// Passport 세션 설정
passport.serializeUser(function (user, done) {
  done(null, user.MBR_ID);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await findUserById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

app.listen(8080, function () {
  console.log('listening on 8080')
});

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '/with-them/build/index.html'));
});

// -------------------------StartPage----------------------------------

// 리뷰 데이터 가져오기
app.get('/api/showReview', async function (req, res) {
  try {
    const db = await getDbConnection();
    // ORDER BY RAND()를 사용해 랜덤 정렬 후 LIMIT 4를 추가하여 상위 4개만 선택
    const [results] = await db.query('SELECT rvw_mgmt_tb.RVW_CONT, mbr_account_tb.MBR_ID, mbr_account_tb.MBR_NICK, mbr_account_tb.MBR_PFP FROM rvw_mgmt_tb JOIN mbr_account_tb ON rvw_mgmt_tb.FK_MBR_RVW = mbr_account_tb.MBR_SEQ ORDER BY RAND() LIMIT 4');
    res.json(results);
  } catch (error) {
    console.error("Database query error: ", error);
    res.status(500).send("Internal Server Error");
  }
});

// 세션 유무 확인
app.get('/api/check-session', function(req, res) {
  if (req.isAuthenticated()) { // 사용자가 인증된 경우
    res.send({ isLoggedIn: true });
  } else {
    res.send({ isLoggedIn: false });
  }
});

// 로그아웃
app.post('/api/logout', function(req, res) {
  req.logout(function(err) {
    if (err) { return next(err); }
    req.session.destroy(function(err) {
      if (err) {
        return next(err);
      }
      res.send({ isLoggedIn: false });
    });
  });
});



// -------------------------DiscoverPage----------------------------------

// DiscoverPage 카드 데이터 가져오기
app.get('/api/showDiscoverGroup', async function (req, res) {
  try {
    const db = await getDbConnection();
    const query1 = 'SELECT grp_mgmt_tb.GRP_SEQ, grp_mbr_tb.FK_MBR_GRP_MBR FROM grp_mgmt_tb JOIN grp_mbr_tb ON grp_mgmt_tb.GRP_SEQ = grp_mbr_tb.FK_GRP_MGMT_GRP_MBR';
    const query2 = 'SELECT grp_mgmt_tb.GRP_SEQ, grp_mgmt_tb.GRP_NM, grp_mgmt_tb.GRP_CONT, cat_list_tb.CAT_TYPE FROM grp_mgmt_tb JOIN cat_list_tb ON grp_mgmt_tb.FK_CAT_GRP = cat_list_tb.CAT_SEQ';

    const [members] = await db.query(query1);
    const [groups] = await db.query(query2);

    const combinedResults = {
      members,
      groups,
    };

    res.json(combinedResults);
  } catch (error) {
    console.error("데이터베이스 쿼리 에러: ", error);
    res.status(500).send("Internal Server Error");
  }
});

// DiscoverPage 그룹 join 처리
app.post('/api/joinGroup', async function (req, res) {
  try {
    const userSeq = req.user.MBR_SEQ; // 로그인한 사용자의 SEQ
    const db = await getDbConnection();

    // 해당하는 그룹 멤버가 있는지 체크
    const [isExist] = await db.query('SELECT * FROM grp_mbr_tb WHERE FK_MBR_GRP_MBR = ? AND FK_GRP_MGMT_GRP_MBR = ?', [userSeq, req.body.selectedGroupSeq]);

    // 데이터가 존재하지 않을 경우에만 INSERT 실행
    if (isExist.length === 0) {
      const [joinGrp] = await db.query(
        'INSERT INTO grp_mbr_tb (FK_MBR_GRP_MBR, FK_GRP_MGMT_GRP_MBR) VALUES (?, ?)',
        [userSeq, req.body.selectedGroupSeq]
      );

      res.status(200).send({ message: "Group joined successfully." });
    } else {
      res.status(400).send({ message: "Already a member of the group." });
    }
  } catch (error) {
    console.error("데이터베이스 쿼리 에러: ", error);
    res.status(500).send("Internal Server Error");
  }
});


// -------------------------ModalWindow----------------------------------

// 모달창 카드 데이터 가져오기
app.get('/api/showModalWindow/:grpSeq', async function (req, res) {
  try {
    const grpSeq = req.params.grpSeq;
    const db = await getDbConnection();

    const query1 = 'SELECT GRP_SEQ, GRP_CONT FROM grp_mgmt_tb WHERE GRP_SEQ = ?';
    const query2 = 'SELECT GRP_RULE_SEQ, GRP_RULE_CONT FROM grp_rule_tb WHERE FK_GRP_MGMT_GRP_RULE = ?';

    const [groups] = await db.query(query1, [grpSeq]);
    const [rules] = await db.query(query2, [grpSeq]);

    const combinedResults = {
      groups,
      rules,
    };

    res.json(combinedResults);
  } catch (error) {
    console.error("데이터베이스 쿼리 에러: ", error);
    res.status(500).send("Internal Server Error");
  }
});

// -------------------------LoginPage----------------------------------


// 로그인 처리
app.post('/api/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: '서버 오류' });
    }
    if (!user) {
      return res.status(401).json({ message: info.message });
    }
    req.logIn(user, (err) => { // 사용자 세션에 로그인 정보 저장
      if (err) {
        return res.status(500).json({ message: '로그인 처리 중 오류' });
      }
      return res.json({ message: '로그인 성공' });
    });
  })(req, res, next);
});

// -------------------------JoinPage----------------------------------

// 회원가입 라우트
app.post('/api/signup', async (req, res) => {
  const db = await getDbConnection();
  const { id, password, nickname } = req.body;

  // 중복 사용자 검증
  const [existingUser] = await db.query('SELECT * FROM mbr_account_tb WHERE MBR_ID = ? ', [id]);
  if (existingUser.length > 0) {
    return res.status(200).json({ success: false, message: '이미 등록된 사용자 ID입니다.' });
  }

  // 비밀번호 암호화
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // 사용자 생성
  try {
    const newUser = await db.query('INSERT INTO mbr_account_tb (MBR_ID, MBR_PWD, MBR_NICK) VALUES (?, ?, ?)', [id, hashedPassword, nickname]);
    res.status(201).json({ success: true, message: '회원가입에 성공했습니다.' });
  } catch (error) {
    res.status(500).json({ success: false, message: '서버 오류로 인해 회원가입에 실패했습니다.' });
  }
});
// -------------------------사용자 정보 반환----------------------------------

// 사용자 정보를 반환하는 API 엔드포인트
app.get('/api/user', (req, res) => {
  if (req.user) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ message: '로그인되지 않았습니다.' });
  }
});

// -------------------------CreateGroupPage----------------------------------


// 그룹 만들기
app.post('/api/group', async (req, res) => {
  try {
    const { name, description, category, rules } = req.body; // 클라이언트로부터 받은 그룹 정보

    const db = await getDbConnection(); // 데이터베이스 연결

    const selectCategory = await db.query('SELECT CAT_SEQ FROM cat_list_tb WHERE CAT_TYPE = ?', [category]); // 카테고리 seq 가져오기
    const catSeqValue = selectCategory[0][0].CAT_SEQ;

    const saveGrp = await db.query(
      'INSERT INTO grp_mgmt_tb (GRP_NM, GRP_CONT, FK_CAT_GRP) VALUES (?, ?, ?)',
      [name, description, catSeqValue]
    );

    const groupId = saveGrp[0].insertId;   // 방금 생성된 그룹의 ID 가져오기

    for (let rule of rules) {
      await db.query(
        'INSERT INTO grp_rule_tb (GRP_RULE_CONT, FK_GRP_MGMT_GRP_RULE) VALUES (?, ?)',
        [rule, groupId]
      );
    } // 규칙 DB 저장

    const userSeq = req.user.MBR_SEQ; // 로그인한 사용자의 SEQ
    await db.query(
      'INSERT INTO grp_mbr_tb (FK_MBR_GRP_MBR, FK_GRP_MGMT_GRP_MBR) VALUES (?, ?)',
      [userSeq, groupId]
    ); // 최초 그룹 생성자는 자동으로 그룹원으로 추가

    res.status(201).json({ message: 'Group created successfully.' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create the group due to server error.' });
  }
});

// -------------------------MyGroupPage----------------------------------

// MyGroupPage 카드 데이터 가져오기
app.get('/api/showMyGroup', async function (req, res) {
  try {
    const db = await getDbConnection();
    const userSeq = req.user.MBR_SEQ;

    const query1 = 'SELECT grp_mgmt_tb.GRP_SEQ, grp_mbr_tb.FK_MBR_GRP_MBR FROM grp_mgmt_tb JOIN grp_mbr_tb ON grp_mgmt_tb.GRP_SEQ = grp_mbr_tb.FK_GRP_MGMT_GRP_MBR';
    const query2 = 'SELECT grp_mgmt_tb.GRP_SEQ, grp_mgmt_tb.GRP_NM, grp_mgmt_tb.GRP_CONT, cat_list_tb.CAT_TYPE FROM grp_mbr_tb JOIN grp_mgmt_tb ON grp_mbr_tb.FK_GRP_MGMT_GRP_MBR = grp_mgmt_tb.GRP_SEQ JOIN cat_list_tb ON grp_mgmt_tb.FK_CAT_GRP = cat_list_tb.CAT_SEQ WHERE grp_mbr_tb.FK_MBR_GRP_MBR = ?';

    const [members] = await db.query(query1);
    const [groups] = await db.query(query2, [userSeq]);

    const combinedResults = {
      members,
      groups,
    };

    res.json(combinedResults);
  } catch (error) {
    console.error("데이터베이스 쿼리 에러: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// MyGroupPage 그룹 탈퇴하기
app.post('/api/quitGroup', async function (req, res) {
  try {
    const db = await getDbConnection();
    const userSeq = req.user.MBR_SEQ; // 로그인한 사용자의 SEQ
    const groupSeq = req.body.selectedGroupSeq // 선택한 그룹 카드 (그룹 SEQ)

    await db.query(
      'DELETE FROM grp_mbr_tb WHERE FK_GRP_MGMT_GRP_MBR = ? AND FK_MBR_GRP_MBR = ? ',
      [groupSeq, userSeq]
    );

    res.status(201).json({ message: 'Group deleted successfully.' });

  } catch (error) {
    console.error("데이터베이스 쿼리 에러: ", error);
    res.status(500).send("Internal Server Error");
  }
});

// -------------------------ModalWindow----------------------------------

// 그룹 만들기
app.post('/api/submitReview', async (req, res) => {
  try {
    const { review } = req.body;
    const userSeq = req.user.MBR_SEQ;

    const db = await getDbConnection();

    await db.query('INSERT INTO rvw_mgmt_tb (RVW_CONT, FK_MBR_RVW) VALUES (?, ?)', [review, userSeq]);

    res.status(201).json({ message: 'Group created successfully.' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create the group due to server error.' });
  }
});

// -------------------------SettingPage----------------------------------


// 닉네임 중복 확인
app.post('/api/nickname/check', async (req, res) => {
  const db = await getDbConnection();
  const { nickname } = req.body;

  const query = 'SELECT * FROM mbr_account_tb WHERE MBR_NICK = ? ';
  const [rows] = await db.query(query, [nickname]);

  if (rows.length === 0) {
    res.json({ available: true });
  } else {
    res.json({ available: false });
  }
});


// 정보 변경
app.post('/api/nickname/change', upload.single('avatar'), async (req, res) => {
  const db = await getDbConnection();
  const { nickname } = req.body;
  const userNick = req.user.MBR_NICK;
  let avatarUrl = req.file ? req.file.location : undefined;

  if (avatarUrl) {
    // avatarUrl이 있는 경우, 닉네임과 프로필 사진 모두 업데이트
    const query = 'UPDATE mbr_account_tb SET MBR_NICK = ?, MBR_PFP = ? WHERE MBR_NICK = ?';
    await db.query(query, [nickname, avatarUrl, userNick]);
  } else {
    // avatarUrl이 없는 경우, 닉네임만 업데이트
    const query = 'UPDATE mbr_account_tb SET MBR_NICK = ? WHERE MBR_NICK = ?';
    await db.query(query, [nickname, userNick]);
  }

  res.json({ success: true, avatarUrl: avatarUrl });
});


// -------------------------GroupInPage----------------------------------
// 그룹 멤버 목록 가져오기
app.get('/api/members', async (req, res) => {
  const db = await getDbConnection();
  const { groupSeq } = req.query;

  const query = 'SELECT g.GRP_MBR_SEQ, m.MBR_ID, m.MBR_NICK, m.MBR_PFP FROM grp_mbr_tb g JOIN mbr_account_tb m ON g.FK_MBR_GRP_MBR = m.MBR_SEQ WHERE g.FK_GRP_MGMT_GRP_MBR = ?;';
  const [rows] = await db.query(query, [groupSeq]);

  res.json({ members: rows });
});

// 달력 사진 올리기
app.post('/api/upload/file', upload.single('file'), async (req, res) => {
  const db = await getDbConnection();
  const userSeq = req.user.MBR_SEQ;
  const groupSeq = req.body.selectedGroupSeq; 
  const date = req.body.date;
  let fileUrl = req.file ? req.file.location : undefined;

  const query = 'INSERT INTO cal_mgmt_tb (CAL_POST_DATE, CAL_POST_IMG, FK_GRP_CAL, FK_MBR_CAL) VALUES (?, ?, ?, ?)';
  await db.query(query, [date, fileUrl, groupSeq, userSeq]);

  res.json({ success: true });
});

// 달력 데이터 가져오기
app.get('/api/data', async (req, res) => {
  const db = await getDbConnection();
  const { date, groupSeq } = req.query;

  const query = 'SELECT cal_mgmt_tb.CAL_SEQ, cal_mgmt_tb.CAL_POST_IMG, mbr_account_tb.MBR_NICK FROM cal_mgmt_tb JOIN mbr_account_tb ON cal_mgmt_tb.FK_MBR_CAL = mbr_account_tb.MBR_SEQ WHERE FK_GRP_CAL = ? AND CAL_POST_DATE = ?';
  const [rows] = await db.query(query, [groupSeq, date]);

  if (rows) {
      res.json(rows);
  } else {
      res.json({ content: "해당 날짜에 대한 데이터가 없습니다." });
  }
});

// 그룹 게시판 가져오기
app.get('/api/board', async (req, res) => {
  const db = await getDbConnection();
  const { groupSeq } = req.query;

  const query = 'SELECT b.BOARD_SEQ, b.BOARD_CONT, b.BOARD_DATE, m.MBR_ID, m.MBR_PFP FROM board_mgmt_tb AS b JOIN grp_mgmt_tb AS g ON b.FK_GRP_BOARD = g.GRP_SEQ JOIN mbr_account_tb AS m ON b.FK_MBR_BOARD = m.MBR_SEQ WHERE b.FK_GRP_BOARD = ? AND b.BOARD_DATE >= CURDATE() - INTERVAL 7 DAY ORDER BY b.BOARD_DATE DESC;';
  const [rows] = await db.query(query, [groupSeq]);

  res.json({ board: rows });
});

// 그룹 게시판 글 올리기
app.post('/api/board/post', async (req, res) => {
  try {
    const db = await getDbConnection();
    const { groupSeq, postContent } = req.body;
    const userSeq = req.user.MBR_SEQ;

    // 현재 시간
    const now = new Date();
    const kst = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    // YYYY-MM-DD HH:MM:SS 포맷으로 변환합니다.
    const formattedDate = kst.toISOString().replace(/T/, ' ').replace(/\..+/, '');

    const query = 'INSERT INTO board_mgmt_tb(BOARD_CONT, BOARD_DATE, FK_GRP_BOARD, FK_MBR_BOARD) VALUES (?, ?, ?, ?)'
    await db.query(query, [postContent, formattedDate, groupSeq, userSeq]);

    res.status(201).send('게시글이 성공적으로 등록되었습니다.');

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create the group due to server error.' });
  }
});

// 그룹 게시판 가져오기
app.get('/api/missions', async (req, res) => {
  const db = await getDbConnection();
  const { groupSeq } = req.query;

  const query = 'SELECT m.MSN_SEQ, m.MSN_CONT, m.MSN_TITLE FROM msn_mgmt_tb m JOIN grp_mgmt_tb g ON m.FK_CAT_MSN = g.FK_CAT_GRP WHERE g.GRP_SEQ = ?';
  const [rows] = await db.query(query, [groupSeq]);

  res.json({ missions: rows });
});

// -------------------------*----------------------------------



// 가장 하단
app.get('*', function (요청, 응답) {
  응답.sendFile(path.join(__dirname, '/with-them/build/index.html'));
});


